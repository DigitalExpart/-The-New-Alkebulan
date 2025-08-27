import { SupabaseClient } from "@supabase/supabase-js"

export type WebRTCChannel = ReturnType<SupabaseClient["channel"]>

export function getWebRTCChannel(supabase: SupabaseClient, conversationId: string): WebRTCChannel {
  return supabase.channel(`webrtc-${conversationId}`, {
    config: {
      broadcast: {
        self: false, // Don't receive your own broadcasts
      },
    },
  })
}

export const defaultRtcConfiguration: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ],
}
