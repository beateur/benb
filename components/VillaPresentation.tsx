'use client';

import { motion } from 'framer-motion';

interface VillaPresentationProps {
  propertyId?: string;
}

export default function VillaPresentation({ propertyId = "default" }: VillaPresentationProps) {
  return (
    <section id="villa-presentation" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            À propos de cette villa d'exception
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Découvrez tous les détails de cette propriété unique
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Introduction Block */}
          <motion.div
            className="border-2 border-border rounded-xl p-8 bg-card shadow-lg hover:shadow-xl transition-shadow duration-300"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold mb-4 text-foreground">À propos de ce logement</h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                La Villa Roya, entièrement rénovée en 2024 est une maison somptueuse
                de 300 m² sur les hauteurs de Saint-Florent avec une vue panoramique
                sur la mer et la montagne. Vous trouverez ici l'un des meilleurs
                points de vue sur le Golf de Saint-Florent. Avec son architecture
                épurée et sa décoration design, elle vous promet un séjour haut de
                gamme au milieu d'un cadre naturel envoûtant.
              </p>
              <p>
                La maison dispose de 5 chambres avec salle de bain privée. La piscine
                à débordement est chauffée de mai à octobre.
              </p>
            </div>
          </motion.div>

          {/* Plan détaillé Block */}
          <motion.div
            className="border-2 border-border rounded-xl p-8 bg-card shadow-lg hover:shadow-xl transition-shadow duration-300"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold mb-4 text-foreground">Plan détaillé</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">Au 1<sup>er</sup> étage</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                  <li>1 grand salon avec salle à manger, cuisine ouverte et tout équipée</li>
                  <li>La suite parentale avec terrasse et salle de bain</li>
                  <li>1 toilette</li>
                  <li>1 grande terrasse de 30 m² face à la mer</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Au RDC</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                  <li>4 chambres doubles avec leur salle de bain privée (3 douches et 1 baignoire) et un accès terrasse</li>
                  <li>1 buanderie</li>
                  <li>2 toilettes</li>
                  <li>1 salle cinéma</li>
                  <li>1 grande terrasse en bois de 60 m² face à la mer</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Extérieur</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                  <li>1 piscine à débordement avec vue sur la mer et son espace chaises longues avec douche extérieure (piscine chauffée de mai à octobre)</li>
                  <li>1 terrain de pétanque</li>
                  <li>Parking pour 2 voitures à l'intérieur de la villa et 2 à l'extérieur</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Informations importantes - Full width */}
        <motion.div
          className="border-2 border-border rounded-xl p-8 bg-card shadow-lg hover:shadow-xl transition-shadow duration-300"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-semibold mb-4 text-foreground">Informations importantes</h3>
          <ul className="list-disc list-inside space-y-3 text-muted-foreground leading-relaxed">
            <li>De jolies rambardes vitrées ont été installées autour de la terrasse de la piscine pour des raisons de sécurité (photos à venir).</li>
            <li>Villa déconseillée aux enfants de moins de 8 ans. Les enfants doivent être sous la surveillance de leurs parents.</li>
            <li>L'arrivée à la villa est fixée à 16 h et le départ à 11 h. Une arrivée anticipée ou un départ tardif peut être possible selon la disponibilité de la villa.</li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
