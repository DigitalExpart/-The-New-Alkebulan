// "use client";

// import { Users, Building2, Coins, Activity, BarChart3, Wallet } from "lucide-react";

// const features = [
//   {
//     icon: Users,
//     title: "Community Projects",
//     description: "Support local and global community-driven initiatives that make lasting social impact."
//   },
//   {
//     icon: Building2,
//     title: "Business Projects",
//     description: "Back promising businesses and startups to drive innovation and job creation."
//   },
//   {
//     icon: Coins,
//     title: "Token Award System",
//     description: "Earn rewards and recognition through blockchain-based token incentives."
//   },
//   {
//     icon: Activity,
//     title: "Health Tracking System",
//     description: "Monitor your wellbeing while staying engaged with community-driven health projects."
//   },
//   {
//     icon: BarChart3,
//     title: "Finance Dashboard",
//     description: "Access analytics, finance tips, and manage your portfolio with an integrated dashboard."
//   },
//   {
//     icon: Wallet,
//     title: "Governance & Wallet",
//     description: "Participate in decentralized governance (DAO), manage crypto securely, and contribute to future decision-making."
//   }
// ];

// export default function FeaturesCards() {
//   return (
//     <div className="">
//       <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//         {features.map((feature, i) => (
//           <div
//             key={i}
//             className="p-6 border rounded-xl shadow-sm hover:shadow-md transition bg-muted"
//           >
//             {/* Icon */}
//             <div className="w-10 h-10 flex items-center justify-center rounded-md bg-yellow-400 text-black mb-4">
//               <feature.icon className="w-5 h-5" />
//             </div>

//             {/* Title */}
//             <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>

//             {/* Description */}
//             <p className="text-sm text-gray-300">{feature.description}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
