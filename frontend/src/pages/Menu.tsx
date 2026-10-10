import { Coffee } from 'lucide-react';
import { Empty, ErrorState, Loading } from '../components/States';
import { money } from '../lib/format';
import { useFetch } from '../lib/useFetch';
import type { MenuItem } from '../types';

export default function Menu() {
  const { data, loading, error } = useFetch<MenuItem[]>('/menu');
  const groups = new Map<string, MenuItem[]>();
  for (const item of data ?? []) groups.set(item.category, [...(groups.get(item.category) ?? []), item]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-14 text-center">
        <span className="eyebrow">Del campo a la mesa</span>
        <h1 className="serif mb-4 text-5xl text-olive md:text-6xl">Menú del restaurante</h1>
        <p className="mx-auto max-w-2xl text-lg text-ink/60">Ingredientes de nuestra huerta y de productores de Norcasia.</p>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} />
      ) : groups.size === 0 ? (
        <Empty message="Estamos preparando nuestro menú." />
      ) : (
        <div className="card space-y-12 p-8 sm:p-12">
          {[...groups.entries()].map(([category, items]) => (
            <section key={category}>
              <h2 className="serif mb-6 flex items-center gap-3 border-b border-olive/10 pb-3 text-3xl text-olive">
                <Coffee size={22} /> {category}
              </h2>
              <ul className="space-y-6">
                {items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-6">
                    <div>
                      <h3 className="font-semibold text-ink">{item.name}</h3>
                      {item.description && <p className="text-sm text-ink/60">{item.description}</p>}
                    </div>
                    <span className="shrink-0 font-bold text-olive">{money(item.price)}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
