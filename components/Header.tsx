import React from "react";
import { signOut, useSession } from "next-auth/react";

export const Header: React.FC = () => {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold text-gray-900">{session?.user?.name}</h2>
          <p className="truncate text-sm text-gray-500">{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="shrink-0 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};
