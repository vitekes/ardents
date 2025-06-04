'use client';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [twitter, setTwitter] = useState('');
  const [telegram, setTelegram] = useState('');
  const [website, setWebsite] = useState('');
  const [donationAddress, setDonationAddress] = useState('');

  if (!session) return <p>Please login</p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, bio, twitter, telegram, website, donationAddress }),
    });
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Profile</h1>
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <input
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="border p-2"
        />
        <textarea
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="border p-2"
        />
        <input
          type="text"
          placeholder="Twitter"
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
          className="border p-2"
        />
        <input
          type="text"
          placeholder="Telegram"
          value={telegram}
          onChange={(e) => setTelegram(e.target.value)}
          className="border p-2"
        />
        <input
          type="text"
          placeholder="Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="border p-2"
        />
        <input
          type="text"
          placeholder="Donation address"
          value={donationAddress}
          onChange={(e) => setDonationAddress(e.target.value)}
          className="border p-2"
        />
        <button type="submit" className="px-4 py-2 border rounded">Save</button>
      </form>
    </div>
  );
}
