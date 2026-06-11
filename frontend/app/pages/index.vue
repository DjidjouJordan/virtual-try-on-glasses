<template>
  <div>
    <UPageHero
      title="DPGlasses"
      title-class="text-5xl sm:text-6xl"
      description="Essayez vos lunettes en réalité augmentée, directement dans votre navigateur. Aucune installation, aucune donnée envoyée au serveur. Une expérience immersive et confidentielle."
      :links="[
        {
          label: 'Essayer maintenant',
          to: '/try-on',
          trailingIcon: 'i-lucide-camera',
          size: 'xl',
          color: 'primary'
        },
        {
          label: 'Découvrir comment ça marche',
          to: '#how-it-works',
          icon: 'i-lucide-info',
          size: 'xl',
          color: 'neutral',
          variant: 'subtle'
        }
      ]"
    />

    <UPageSection
      id="how-it-works"
      title="Comment ça fonctionne ?"
      description="Une technologie de pointe, entièrement locale et respectueuse de votre vie privée."
      :features="[
        {
          icon: 'i-lucide-scan-face',
          title: 'Détection faciale en temps réel',
          description: 'MediaPipe analyse 468 points de repère sur votre visage pour un suivi ultra-précis, même sur mobile.'
        },
        {
          icon: 'i-lucide-glasses',
          title: 'Rendu 3D réaliste',
          description: 'Les lunettes sont affichées avec Three.js, supportant l’occlusion, les reflets et les matériaux PBR.'
        },
        {
          icon: 'i-lucide-shield',
          title: '100% confidentiel',
          description: 'L’inférence IA se fait sur votre appareil (WebAssembly). Aucune image ni donnée biométrique ne quitte votre navigateur.'
        },
        {
          icon: 'i-lucide-wifi-off',
          title: 'Fonctionne hors-ligne',
          description: 'Installez DPGlasses comme une PWA et essayez vos montures favorites même sans connexion internet.'
        },
        {
          icon: 'i-lucide-camera',
          title: 'Capture & Partage',
          description: 'Prenez un selfie avec les lunettes virtuelles et partagez-le directement sur vos réseaux.'
        },
        {
          icon: 'i-lucide-shopping-bag',
          title: 'Catalogue dynamique',
          description: 'Changez de modèle en un clic, ajoutez vos favoris et passez commande en ligne.'
        }
      ]"
    />

    <UPageSection>
      <UPageCTA
        title="Prêt à changer de look ?"
        description="Aucune installation, aucune inscription. Activez votre caméra et essayez nos lunettes virtuellement."
        variant="subtle"
        :links="[
          {
            label: 'Lancer l’essayage',
            to: '/try-on',
            trailingIcon: 'i-lucide-arrow-right',
            color: 'primary'
          },
          {
            label: 'Voir le code source',
            to: 'https://github.com/ton-repo/dpglasses',
            target: '_blank',
            icon: 'i-simple-icons-github',
            color: 'neutral',
            variant: 'outline'
          }
        ]"
      />
    </UPageSection>

    <UPageSection>
      <div class="text-center text-muted text-sm">
        <p>
          Construit avec ❤️ au Cameroun — Technologies : Nuxt 4, Three.js, MediaPipe, Laravel 13, PostgreSQL.
        </p>
      </div>
    </UPageSection>
  </div>
</template>