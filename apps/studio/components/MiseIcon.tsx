import {isDevStudio} from '../lib/studio-env'

export function MiseIcon() {
  const dev = isDevStudio()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      width="1em"
      height="1em"
    >
      <rect width="32" height="32" rx="8" fill={dev ? '#7C2D12' : '#173124'} />
      <path
        d="M8.5 22.5V9.5l5.25 8.25L19 9.5v13"
        stroke="#FAF9F6"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="23.25" cy="10.25" r="2.15" fill={dev ? '#FDBA74' : '#85A392'} />
      <path
        d="M21.5 23.5h3.5"
        stroke={dev ? '#FED7AA' : '#B0CDBB'}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {dev ? <rect x="6" y="6" width="8" height="4" rx="1" fill="#F97316" stroke="#FAF9F6" strokeWidth="0.75" /> : null}
    </svg>
  )
}
