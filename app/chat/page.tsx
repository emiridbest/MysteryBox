import Chat from "../../components/Chat";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Chat Container - Takes full height now that header is removed */}
      <div className="flex-1 overflow-hidden">
        <Chat />
      </div>
    </div>
  );
}