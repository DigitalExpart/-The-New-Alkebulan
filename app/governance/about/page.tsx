import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold text-center mb-8 text-foreground">About Diaspora Governance</h1>

      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-foreground">Our Vision</h2>
        <p className="text-lg text-muted-foreground">
          We envision a decentralized and transparent governance system for the Diaspora ecosystem, empowering community
          members to actively participate in decision-making processes and shape the future of the platform.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-foreground">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Proposals</CardTitle>
              <CardDescription className="text-muted-foreground">
                Community members can submit proposals for improvements, new features, or changes to the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Proposals are reviewed and discussed by the community.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Voting</CardTitle>
              <CardDescription className="text-muted-foreground">
                Token holders can vote on proposals using their governance tokens.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Voting power is proportional to the number of tokens held.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Implementation</CardTitle>
              <CardDescription className="text-muted-foreground">
                Approved proposals are implemented by the development team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The community monitors the implementation process and provides feedback.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6 text-foreground">Core Principles</h2>
        <ul className="list-disc list-inside text-lg text-muted-foreground">
          <li>Transparency: All governance processes and decisions are publicly accessible.</li>
          <li>Decentralization: Power is distributed among community members.</li>
          <li>Inclusivity: All community members are welcome to participate.</li>
          <li>Accountability: Decision-makers are accountable to the community.</li>
        </ul>
      </section>
    </div>
  )
}
