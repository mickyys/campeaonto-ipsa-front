import HomeView from '@/views/HomeView'

export const metadata = {
  title: { absolute: 'Campeonato de Apoderados IPSA San Antonio 2026' },
  description:
    'Resultados, posiciones, fixture y goleadores del Campeonato de Apoderados del Instituto del Puerto San Antonio.',
}

export default function Home() {
  return <HomeView />
}
