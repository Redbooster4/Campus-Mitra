import { FileText, Clock, CheckCircle2, MessageSquare } from "lucide-react";

const statusCards = [
  { label: "Application Status", value: "Under Review", icon: Clock, color: "text-yellow-400" },
  { label: "Documents Verified", value: "2 / 4", icon: FileText, color: "text-indigo-400" },
  { label: "Fee Status", value: "Paid", icon: CheckCircle2, color: "text-green-400" },
];

function MainContent() {
  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 bg-[#120C24] overflow-y-auto">
      <h1 className="text-white text-xl sm:text-2xl font-bold mb-1">Welcome back 👋</h1>
      <p className="text-indigo-300 text-sm mb-6 md:mb-8">
        Here's an overview of your admission progress.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-8 md:mb-10">
        {statusCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-[#1A1333] border border-[#2E1F6B] rounded-2xl p-4 md:p-5 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl bg-[#0F0B1F] ${color} shrink-0`}>
              <Icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-indigo-300 text-xs truncate">{label}</p>
              <p className="text-white text-lg font-semibold truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#1A1333] border border-[#2E1F6B] rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
        <h2 className="text-white font-semibold mb-4">Recent Activity</h2>
        <ul className="space-y-3 text-sm text-indigo-200">
          <li className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-[#2E1F6B] pb-2">
            <span>Document "10th Marksheet" verified</span>
            <span className="text-indigo-400 text-xs sm:text-sm">2 days ago</span>
          </li>
          <li className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-[#2E1F6B] pb-2">
            <span>Fee payment received</span>
            <span className="text-indigo-400 text-xs sm:text-sm">4 days ago</span>
          </li>
          <li className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span>Application submitted</span>
            <span className="text-indigo-400 text-xs sm:text-sm">6 days ago</span>
          </li>
        </ul>
      </div>

      <div className="bg-indigo-600 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-semibold text-lg">Have a question?</h2>
          <p className="text-indigo-100 text-sm">
            Ask our AI Assistant anytime, day or night.
          </p>
        </div>
        <button className="bg-white text-indigo-700 font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-50 transition-colors w-full sm:w-auto justify-center">
          <MessageSquare size={18} />
          Start Chat
        </button>
      </div>
    </main>
  );
}

export default MainContent;