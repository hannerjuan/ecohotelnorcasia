export function Loading({ label = 'Cargando...' }: { label?: string }) {
  return <div className="serif flex h-72 animate-pulse items-center justify-center text-xl text-olive">{label}</div>;
}

export function ErrorState({ message }: { message: string }) {
  return <div className="mx-auto my-16 max-w-lg rounded-2xl bg-red-50 p-6 text-center text-red-700">{message}</div>;
}

export function Empty({ message }: { message: string }) {
  return <div className="card serif p-16 text-center text-2xl text-ink/50">{message}</div>;
}
