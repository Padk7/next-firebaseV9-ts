import { AnyTxtRecord } from 'dns';
import Link from 'next/link';
import { useContext, ReactElement } from 'react';
import { UserContext } from '../lib/context';

type Props = {
  children: JSX.Element,
  fallback?: JSX.Element
}

// Component's children only shown to logged-in users
export default function AuthCheck(props: Props): JSX.Element {
  const { username } = useContext(UserContext)
  return username ? props?.children :
    props?.fallback ? props.fallback :
    <Link href="/enter">You must be signed in</Link>
}