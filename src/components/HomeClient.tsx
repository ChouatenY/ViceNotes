"use client";

import React, { useState } from "react";
import TypewriterTitle from "@/components/ui/TypewriterTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, UserPlus, RefreshCw, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase-config";
import { User as UserType } from "@/lib/firebase-config";

const HomeClient = () => {
  const { user, loading, switchUser } = useAuth();
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [newUserName, setNewUserName] = useState("");

  // Function to create a new user
  const createNewUser = () => {
    const newUser: UserType = {
      id: 'user-' + Math.random().toString(36).substring(2, 10),
      name: newUserName || 'New User',
    };
    switchUser(newUser);
    setShowUserSelector(false);
    setNewUserName("");
  };

  // Function to generate a random user
  const generateRandomUser = () => {
    const randomNames = [
      "Alex", "Taylor", "Jordan", "Casey", "Riley",
      "Morgan", "Avery", "Quinn", "Skyler", "Dakota"
    ];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];

    const newUser: UserType = {
      id: 'user-' + Math.random().toString(36).substring(2, 10),
      name: randomName,
    };
    switchUser(newUser);
  };

  return (
    <div className="bg-gradient-to-r min-h-screen grainy from-[#e2dac4] to-[#f5f2e8]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Logo" className="w-54 h-24" />
        </div>
        <h1 className="font-semibold text-7xl text-center">
          AI <span className="text-[#47423e] font-bold">note taking</span>{" "}
          assistant.
        </h1>
        <div className="mt-4"></div>
        <h2 className="font-semibold text-3xl text-center text-slate-700">
          <TypewriterTitle />
        </h2>
        <div className="mt-8"></div>

        <div className="flex justify-center gap-4">
          {loading ? (
            <Button className="bg-gray-400" disabled>
              Loading...
            </Button>
          ) : (
            <>
              <Link href="/dashboard">
                <Button className="bg-[#47423e] hover:bg-[#e2dac4] hover:text-[#47423e] text-[#e2dac4] transition-colors duration-300">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" strokeWidth={3} />
                </Button>
              </Link>
              <Button
                className="bg-[#e2dac4] text-[#47423e] hover:bg-[#47423e] hover:text-[#e2dac4] transition-colors duration-300"
                onClick={() => setShowUserSelector(!showUserSelector)}
              >
                <User className="mr-2 h-5 w-5" />
                Switch User
              </Button>
            </>
          )}
        </div>

        {user && (
          <div className="mt-4 text-center p-4 border border-[#47423e] rounded-lg bg-[#e2dac4]/30 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-[#47423e] mb-2">
              Current User
            </h3>
            <div className="bg-white p-3 rounded-md shadow-sm mb-2">
              <p className="font-medium">
                Name: <span className="text-[#47423e]">{user.name}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                User ID: <span className="font-mono text-xs bg-gray-100 p-1 rounded">{user.id}</span>
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Your notes and data are associated with this user ID
            </p>
          </div>
        )}

        {showUserSelector && (
          <div className="mt-4 text-center max-w-md p-4 border border-[#47423e] rounded-lg bg-[#e2dac4]/30 mx-auto">
            <h3 className="text-lg font-bold text-[#47423e] mb-2">
              Switch User
            </h3>
            <div className="flex items-center mb-3">
              <input
                type="text"
                placeholder="Enter user name"
                className="flex-1 p-2 border rounded-l-md focus:outline-none"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
              <Button
                className="bg-[#47423e] hover:bg-[#e2dac4] hover:text-[#47423e] text-[#e2dac4] transition-colors duration-300 rounded-l-none"
                onClick={createNewUser}
              >
                <UserPlus className="mr-1 h-4 w-4" />
                Create
              </Button>
            </div>
            <Button
              className="bg-[#47423e] hover:bg-[#e2dac4] hover:text-[#47423e] text-[#e2dac4] transition-colors duration-300 w-full"
              onClick={generateRandomUser}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Random User
            </Button>
            <p className="text-xs text-gray-500 mt-3">
              Each user has their own separate notes and data
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeClient;
