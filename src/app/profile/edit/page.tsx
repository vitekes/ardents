'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [twitter, setTwitter] = useState('');
  const [telegram, setTelegram] = useState('');
  const [website, setWebsite] = useState('');
  const [donationAddress, setDonationAddress] = useState('');

  useEffect(() => {
    if (!session) return;
    fetch('/api/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setNickname(data.nickname ?? '');
        setBio(data.bio ?? '');
        setTwitter(data.twitter ?? '');
        setTelegram(data.telegram ?? '');
        setWebsite(data.website ?? '');
        setDonationAddress(data.donationAddress ?? '');
      });
  }, [session]);

  if (!session) return <p>Please login</p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, bio, twitter, telegram, website, donationAddress }),
    });
    await update();
    router.push('/profile');
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
        <button type="submit" className="px-4 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 transition">Save</button>
      </form>
    </div>
  );
}