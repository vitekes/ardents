'use client';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useAccount, useSignMessage, useConnect } from 'wagmi';
import { SiweMessage } from 'siwe';

export default function Header() {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { connect, connectors } = useConnect();

  async function handleLogin() {
    if (!isConnected || !address) {
      if (connectors?.[0]) {
        await connect({ connector: connectors[0] });
      }
      return;
    }
    const nonceRes = await fetch('/api/auth/csrf');
    const { csrfToken } = await nonceRes.json();
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign in with Ethereum.',
      uri: window.location.origin,
      version: '1',
      chainId: 1,
      nonce: csrfToken,
    });
    const signature = await signMessageAsync({ message: message.prepareMessage() });
    await signIn('credentials', {
      message: JSON.stringify(message),
      signature,
      redirect: false,
    });
  }
  return (
    <header className="flex justify-between items-center p-4 border-b">
      <nav className="flex gap-4">
        <Link href="/">Home</Link>
        {session && (
          session.user?.nickname ? (
            <Link href="/profile">Мой профиль</Link>
          ) : (
            <Link href="/profile/edit">Создать</Link>
          )
        )}
      </nav>
      <div>
        {!session ? (
          <button onClick={handleLogin} className="px-4 py-2 border rounded">
            Login
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {session.user?.image && (
              <Image src={session.user.image} alt="avatar" width={32} height={32} className="rounded-full" />
            )}
            <button onClick={() => signOut()} className="px-4 py-2 border rounded">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
