"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff, Loader2, Volume2, VolumeX } from "lucide-react"
import { getWebRTCChannel, defaultRtcConfiguration } from "@/lib/webrtc-signaling"

interface CallModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string
  currentUserId: string
  otherUserId: string
  startAs: 'audio' | 'video' | 'incoming' // 'incoming' means it's an incoming call, not starting one
  autoStart?: boolean // Automatically start call if not incoming
}

type CallState = 'idle' | 'outgoing' | 'incoming' | 'connecting' | 'active' | 'ended' | 'declined' | 'busy'

export default function CallModal({ open, onOpenChange, conversationId, currentUserId, otherUserId, startAs, autoStart = false }: CallModalProps) {
  const supabase = getSupabaseClient()
  const { profile } = useAuth()

  const [callState, setCallState] = useState<CallState>('idle')
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isSpeakerOff, setIsSpeakerOff] = useState(false)
  const [callMode, setCallMode] = useState<'audio' | 'video'>(startAs === 'incoming' ? 'audio' : startAs) // Default to audio for incoming

  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const rtcChannel = useRef(supabase ? getWebRTCChannel(supabase, conversationId) : null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const callStartTime = useRef<number | null>(null)
  const [callDuration, setCallDuration] = useState<string>('00:00')
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const resetCallState = useCallback(() => {
    if (localStream) { localStream.getTracks().forEach(track => track.stop()) }
    if (remoteStream) { remoteStream.getTracks().forEach(track => track.stop()) }
    if (peerConnection.current) { peerConnection.current.close() }
    if (durationIntervalRef.current) { clearInterval(durationIntervalRef.current) }

    setCallState('idle')
    setLocalStream(null)
    setRemoteStream(null)
    setIsMuted(false)
    setIsCameraOff(false)
    setIsSpeakerOff(false)
    setCallDuration('00:00')
    callStartTime.current = null
    peerConnection.current = null
    onOpenChange(false)
  }, [localStream, remoteStream, onOpenChange])

  useEffect(() => {
    if (!open) { // When modal closes, clean up
      resetCallState()
      return
    }

    if (!supabase || !rtcChannel.current) {
      toast.error("Supabase client or RTC channel not available.")
      onOpenChange(false)
      return
    }

    if (startAs === 'incoming') {
      setCallState('incoming')
    } else if (autoStart) {
      startCall(startAs)
    }

    rtcChannel.current.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log("RTC Channel SUBSCRIBED")
        // If this is an outgoing call and autoStart is true, offer immediately
        if (startAs !== 'incoming' && autoStart && callState === 'idle') {
          // State will be set to 'outgoing' in startCall, so this is just for safety
          console.log("Auto-starting call (outgoing)")
        }
      } else if (status === 'CHANNEL_ERROR') {
        console.error("RTC Channel ERROR")
        toast.error("Realtime channel error. Please try again.")
        resetCallState()
      } else if (status === 'TIMED_OUT') {
        console.warn("RTC Channel TIMED OUT")
        toast.error("Realtime channel timed out. Please check your connection.")
        resetCallState()
      }
    })

    rtcChannel.current.on(
      'broadcast',
      { event: 'offer' },
      async ({ payload }) => {
        if (callState !== 'idle') { // Already in a call
          sendBusySignal()
          return
        }
        if (payload.senderId === currentUserId) return // Ignore self-sent offers
        console.log("Received offer:", payload.offer)
        setCallMode(payload.mode)
        setCallState('incoming')
        setupPeerConnection()
        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(payload.offer))
        const answer = await peerConnection.current?.createAnswer()
        await peerConnection.current?.setLocalDescription(answer)
        rtcChannel.current?.send({
          type: 'broadcast',
          event: 'answer',
          payload: { answer: answer, recipientId: payload.senderId, senderId: currentUserId }
        })
      }
    )

    rtcChannel.current.on(
      'broadcast',
      { event: 'answer' },
      async ({ payload }) => {
        if (payload.recipientId !== currentUserId) return // Not for me
        console.log("Received answer:", payload.answer)
        if (peerConnection.current?.remoteDescription?.type !== 'offer') {
          await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(payload.answer))
        }
        setCallState('active')
        callStartTime.current = Date.now()
        startCallDurationCounter()
        toast.success("Call connected!")
      }
    )

    rtcChannel.current.on(
      'broadcast',
      { event: 'ice' },
      async ({ payload }) => {
        if (payload.recipientId !== currentUserId) return // Not for me
        try {
          await peerConnection.current?.addIceCandidate(new RTCIceCandidate(payload.candidate))
        } catch (e) {
          console.error("Error adding received ICE candidate", e)
        }
      }
    )

    rtcChannel.current.on(
      'broadcast',
      { event: 'hangup' },
      ({ payload }) => {
        if (payload.recipientId === currentUserId || payload.senderId === otherUserId) {
          console.log("Call ended by other party.")
          toast.info("Call ended.")
          resetCallState()
        }
      }
    )

    rtcChannel.current.on(
      'broadcast',
      { event: 'decline' },
      ({ payload }) => {
        if (payload.recipientId === currentUserId) {
          console.log("Call declined by other party.")
          toast.warning("Call declined.")
          resetCallState()
        } else if (payload.senderId === otherUserId && callState === 'outgoing') {
          console.log("Outgoing call declined.")
          toast.warning("Your call was declined.")
          resetCallState()
        }
      }
    )

    rtcChannel.current.on(
      'broadcast',
      { event: 'busy' },
      ({ payload }) => {
        if (payload.recipientId === currentUserId) {
          console.log("Other party is busy.")
          toast.warning("The other party is currently busy.")
          resetCallState()
        } else if (payload.senderId === otherUserId && callState === 'outgoing') {
          console.log("Outgoing call received busy signal.")
          toast.warning("The recipient is on another call.")
          resetCallState()
        }
      }
    )

    return () => {
      console.log("Unsubscribing from RTC channel")
      rtcChannel.current?.unsubscribe()
      resetCallState()
    }
  }, [open, conversationId, currentUserId, otherUserId, startAs, autoStart, callState, resetCallState, supabase])

  const startCallDurationCounter = () => {
    if (durationIntervalRef.current) { clearInterval(durationIntervalRef.current) }
    callStartTime.current = Date.now()
    durationIntervalRef.current = setInterval(() => {
      if (callStartTime.current) {
        const elapsed = Date.now() - callStartTime.current
        const minutes = Math.floor(elapsed / 60000)
        const seconds = Math.floor((elapsed % 60000) / 1000)
        setCallDuration(
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        )
      }
    }, 1000)
  }

  const setupPeerConnection = useCallback(() => {
    peerConnection.current = new RTCPeerConnection(defaultRtcConfiguration)

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate:", event.candidate)
        rtcChannel.current?.send({
          type: 'broadcast',
          event: 'ice',
          payload: { candidate: event.candidate, recipientId: otherUserId, senderId: currentUserId }
        })
      }
    }

    peerConnection.current.ontrack = (event) => {
      console.log("Received remote stream track")
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
        setRemoteStream(event.streams[0])
      }
    }

    peerConnection.current.onconnectionstatechange = () => {
      console.log("RTC connection state change:", peerConnection.current?.connectionState)
      if (peerConnection.current?.connectionState === 'connected') {
        setCallState('active')
        callStartTime.current = Date.now()
        startCallDurationCounter()
        toast.success("Call connected!")
      } else if (peerConnection.current?.connectionState === 'disconnected' || peerConnection.current?.connectionState === 'failed') {
        toast.info("Call disconnected.")
        resetCallState()
      } else if (peerConnection.current?.connectionState === 'closed') {
        resetCallState()
      }
    }

    peerConnection.current.onnegotiationneeded = async () => {
      if (callState === 'outgoing') {
        try {
          const offer = await peerConnection.current?.createOffer()
          await peerConnection.current?.setLocalDescription(offer)
          console.log("Sending offer:", offer)
          rtcChannel.current?.send({
            type: 'broadcast',
            event: 'offer',
            payload: { offer: offer, recipientId: otherUserId, senderId: currentUserId, mode: callMode }
          })
        } catch (err) {
          console.error("Error creating or sending offer", err)
          toast.error("Failed to start call.")
          resetCallState()
        }
      }
    }
  }, [otherUserId, currentUserId, callMode, callState, resetCallState])

  const startMediaStream = useCallback(async (mode: 'audio' | 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mode === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      })
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      stream.getTracks().forEach(track => peerConnection.current?.addTrack(track, stream))
      setCallMode(mode)
      return stream
    } catch (err) {
      console.error("Error accessing media devices:", err)
      toast.error("Failed to access camera or microphone.")
      resetCallState()
      return null
    }
  }, [resetCallState])

  const startCall = useCallback(async (mode: 'audio' | 'video') => {
    setCallState('outgoing')
    setupPeerConnection()
    const stream = await startMediaStream(mode)
    if (stream) {
      // Offer will be created in onnegotiationneeded
    }
  }, [setupPeerConnection, startMediaStream])

  const acceptCall = async (mode: 'audio' | 'video') => {
    setCallState('connecting')
    const stream = await startMediaStream(mode)
    if (stream) {
      // Answer was already sent in the incoming offer handler
      // Just need to set local stream to video ref
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    }
  }

  const declineCall = () => {
    if (rtcChannel.current) {
      rtcChannel.current.send({
        type: 'broadcast',
        event: 'decline',
        payload: { recipientId: otherUserId, senderId: currentUserId }
      })
    }
    toast.info("Call declined.")
    resetCallState()
  }

  const sendHangupSignal = () => {
    if (rtcChannel.current) {
      rtcChannel.current.send({
        type: 'broadcast',
        event: 'hangup',
        payload: { recipientId: otherUserId, senderId: currentUserId }
      })
    }
  }

  const sendBusySignal = () => {
    if (rtcChannel.current) {
      rtcChannel.current.send({
        type: 'broadcast',
        event: 'busy',
        payload: { recipientId: otherUserId, senderId: currentUserId }
      })
    }
  }

  const hangUp = () => {
    sendHangupSignal()
    toast.info("Call ended by you.")
    resetCallState()
  }

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => (track.enabled = !track.enabled))
      setIsMuted(prev => !prev)
    }
  }

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => (track.enabled = !track.enabled))
      setIsCameraOff(prev => !prev)
    }
  }

  const toggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !remoteVideoRef.current.muted
      setIsSpeakerOff(prev => !prev)
    }
  }

  const renderCallControls = () => (
    <div className="flex justify-center gap-6 p-4">
      {callMode === 'video' && (
        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full" onClick={toggleCamera}>
          {isCameraOff ? <VideoOff className="h-6 w-6 text-red-500" /> : <Video className="h-6 w-6" />}
        </Button>
      )}
      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full" onClick={toggleMute}>
        {isMuted ? <MicOff className="h-6 w-6 text-red-500" /> : <Mic className="h-6 w-6" />}
      </Button>
      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full" onClick={toggleSpeaker}>
        {isSpeakerOff ? <VolumeX className="h-6 w-6 text-red-500" /> : <Volume2 className="h-6 w-6" />}
      </Button>
      <Button variant="destructive" size="icon" className="h-12 w-12 rounded-full" onClick={hangUp}>
        <PhoneOff className="h-6 w-6" />
      </Button>
    </div>
  )

  const renderVideoViews = () => (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
      {remoteStream ? (
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
      ) : (
        <div className="text-white/50">Waiting for remote video...</div>
      )}
      <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 w-32 h-24 rounded-lg shadow-lg border-2 border-primary object-cover" />
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-center">
            {callState === 'outgoing' ? 'Calling...' :
             callState === 'incoming' ? 'Incoming Call' :
             callState === 'connecting' ? 'Connecting...' :
             callState === 'active' ? `Call Active ${callDuration}` :
             callState === 'declined' ? 'Call Declined' :
             callState === 'busy' ? 'User Busy' :
             'Call Ended'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {profile?.first_name} {profile?.last_name} calling {otherUserId}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 text-white">
          {callState === 'outgoing' && (
            <div className="text-center space-y-4">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>{profile?.first_name?.[0]}{profile?.last_name?.[0]}</AvatarFallback>
              </Avatar>
              <p className="text-xl font-semibold">Calling {otherUserId}...</p>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {callState === 'incoming' && (
            <div className="text-center space-y-4">
              <Avatar className="h-24 w-24 mx-auto">
                {/* Placeholder for other user's avatar */}
                <AvatarFallback>{otherUserId.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <p className="text-xl font-semibold">Incoming {callMode} call from {otherUserId}</p>
              <div className="flex gap-4">
                <Button variant="default" className="bg-green-500 hover:bg-green-600" onClick={() => acceptCall(callMode)}><Phone className="mr-2" /> Accept</Button>
                <Button variant="destructive" onClick={declineCall}><PhoneOff className="mr-2" /> Decline</Button>
              </div>
            </div>
          )}

          {(callState === 'connecting' || callState === 'active') && callMode === 'video' && (
            renderVideoViews()
          )}

          {(callState === 'connecting' || callState === 'active') && callMode === 'audio' && (
            <div className="text-center space-y-4">
              <Avatar className="h-24 w-24 mx-auto animate-pulse">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>{profile?.first_name?.[0]}{profile?.last_name?.[0]}</AvatarFallback>
              </Avatar>
              <p className="text-xl font-semibold">{callState === 'connecting' ? 'Connecting Audio Call...' : `Audio Call Active ${callDuration}`}</p>
            </div>
          )}

          {callState === 'active' && renderCallControls()}
          {callState === 'connecting' && (
            <div className="flex justify-center p-4">
              <Button variant="destructive" size="icon" className="h-12 w-12 rounded-full" onClick={declineCall}>
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
