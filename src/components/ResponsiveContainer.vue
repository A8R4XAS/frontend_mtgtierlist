<!--
  ResponsiveContainer.vue - Magic-Karten Container mit responsivem Design
-->
<template>
  <div class="responsive-container" :class="containerClasses">
    <div class="magic-card-border" :class="borderClasses">

      <!-- INNERER GOLDENER RAHMEN um alle 4 Elemente -->
      <div class="magic-inner-frame">

        <!-- UMFASSENDES CONTAINER-ELEMENT für alle 4 Bereiche -->
        <div class="magic-content-container">

          <!-- 1. OBERER BEREICH: Name + Mana-Kosten -->
          <div v-if="showMagicHeader && (title || manaCost.length > 0)" class="magic-header">
            <!-- Kartenname / Titel -->
            <div class="card-title">
              <h3 v-if="title" class="title-text">{{ title }}</h3>
            </div>

            <!-- Mana-Kosten Icons -->
            <div class="mana-cost" v-if="manaCost.length > 0">
              <div
                v-for="(mana, index) in manaCost"
                :key="index"
                class="mana-symbol"
                :class="`mana-${mana.toLowerCase()}`"
                :title="`Mana: ${mana}`"
              >
                <!-- Zeige Zahlen direkt als Text, Icons für Farben -->
                <span v-if="isNumericMana(mana)" class="mana-number">{{ mana }}</span>
                <i v-else :class="getManaIcon(mana)" class="mana-icon"></i>
              </div>
            </div>
          </div>

          <!-- 2. MITTLERER BEREICH: Artwork/Bild (Content 1) -->
          <div v-if="showArtwork" class="artwork-section">
            <div class="artwork-container">
              <img v-if="artworkUrl" :src="artworkUrl" :alt="title" class="artwork-image" />
              <div v-else-if="showPlayerInfo && players && players.length > 0" class="player-info-display">
                <!-- Spielerinformationen anzeigen -->
                <div class="players-grid">
                  <div
                    v-for="playerData in players"
                    :key="playerData.position"
                    class="player-card"
                    :class="`player-${playerData.position}`"
                  >
                    <div class="player-row">
                      <div class="player-info">
                        <i class="fas fa-user player-icon"></i>
                        <span class="player-name">{{ playerData.player }}</span>
                      </div>
                      <div class="deck-separator">-</div>
                      <div class="deck-info">
                        <i class="fas fa-magic deck-icon"></i>
                        <span class="deck-name">{{ playerData.deck }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="artwork-placeholder">
                <!-- Fallback Content oder Slot für Artwork -->
                <slot name="artwork">
                  <div class="placeholder-content">
                    <i class="fas fa-image placeholder-icon"></i>
                    <span>Artwork</span>
                  </div>
                </slot>
              </div>
            </div>
          </div>

          <!-- 3. KARTENTYP-ZEILE (Mini Content 1) -->
          <div v-if="cardType || showTypeContent" class="type-line">
            <div class="type-content">
              <span v-if="cardType" class="card-type">{{ cardType }}</span>
              <slot name="typeLine" />
            </div>
          </div>

          <!-- 4. UNTERER BEREICH: Textbox (Content 2) -->
          <div class="textbox-section">
            <div class="textbox-inner">
              <!-- Kartentext -->
              <div v-if="cardText" class="card-text" v-html="cardText"></div>

              <!-- Slot für zusätzlichen Content -->
              <slot name="textbox">
                <slot />
              </slot>

              <!-- Power/Toughness (falls Kreatur) -->
              <div v-if="power !== null && toughness !== null" class="power-toughness">
                <span class="pt-box">{{ power }}/{{ toughness }}</span>
              </div>
            </div>
          </div>

        </div> <!-- Ende magic-content-container -->

      </div> <!-- Ende magic-inner-frame -->

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  // Basis Props
  variant?: 'card' | 'panel' | 'sidebar' | 'full';
  spacing?: 'none' | 'small' | 'medium' | 'large';
  centered?: boolean;
  maxWidth?: string;

  // Magic Card Header
  title?: string;
  manaCost?: string[];
  showMagicHeader?: boolean;

  // Artwork Section
  artworkUrl?: string;
  showArtwork?: boolean;
  showPlayerInfo?: boolean;

  // Type Line
  cardType?: string;
  showTypeContent?: boolean;

  // Textbox Section
  cardText?: string;

  // Creature Stats
  power?: number | null;
  toughness?: number | null;

  // Player Data
  players?: Array<{player: string, deck: string, position: number}>;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'card',
  spacing: 'medium',
  centered: true,
  maxWidth: '100%',
  title: '',
  manaCost: () => [],
  showMagicHeader: true,
  artworkUrl: '',
  showArtwork: true,
  showPlayerInfo: false,
  cardType: '',
  showTypeContent: false,
  cardText: '',
  power: null,
  toughness: null,
  players: () => []
});

const containerClasses = computed(() => [
  `variant-${props.variant}`,
  `spacing-${props.spacing}`,
  {
    'centered': props.centered
  }
]);

const borderClasses = computed(() => [
  `border-variant-${props.variant}`
]);

/**
 * Prüft ob der Mana-Typ eine Zahl ist
 */
const isNumericMana = (manaType: string): boolean => {
  return /^\d+$/.test(manaType);
};

/**
 * Gibt das passende Font Awesome Icon für Mana-Symbole zurück
 */
const getManaIcon = (manaType: string): string => {
  const manaIcons: Record<string, string> = {
    'white': 'fas fa-sun',
    'blue': 'fas fa-tint',
    'black': 'fas fa-skull',
    'red': 'fas fa-fire',
    'green': 'fas fa-leaf',
    'colorless': 'fas fa-circle',
    'default': 'fas fa-star'
  };

  return manaIcons[manaType.toLowerCase()] || manaIcons['default'];
};
</script>

<style scoped>

/* UMFASSENDER CONTAINER für alle 4 Magic-Karten Elemente */
.magic-content-container {
  padding: 6px;
}

/* Magic Header - Authentisch wie echte Magic-Karten */
.magic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  position: relative;
  z-index: 10;  /* Über dem inneren Rahmen-Glanz */

  /* Goldener Rahmen um Header mit schwarzem Rand nur oben/links/rechts */
  border: 2px solid rgb(218, 198, 25);
  border-radius: 16px; /* Stumpfere Abrundung */

  /* Schwarzer Rand nur oben, links und rechts + Subtiler 3D-Absteh-Effekt */
  box-shadow:
    -2px 0 0 0 #000000,                        /* Linker schwarzer Rand */
    2px 0 0 0 #000000,                         /* Rechter schwarzer Rand */
    0 -2px 0 0 #000000,                        /* Oberer schwarzer Rand */
    inset 0 1px 0 rgba(255, 255, 255, 0.6),   /* Oberer Glanz */
    /* OPTIMALER 3D-ABSTEH-EFFEKT - Perfekte Balance */
    0 8px 16px rgba(0, 0, 0, 0.4),            /* Mittlerer tiefer Schatten */
    0 4px 8px rgba(0, 0, 0, 0.5),             /* Sichtbarer Schatten */
    0 0px 1px rgba(0, 0, 0, 0.6),             /* Deutlicher Kontakt-Schatten */
    0 1px 0px rgba(0, 0, 0, 0.7);             /* Scharfer Kontakt-Schatten */

  /* Optimaler physischer Abstand */
  margin: 4px 3px 1px 3px;
  position: relative;

  /* Subtiles Kupfer-Gold Header Background - dunkel außen, hell mittig */
  background:
    linear-gradient(90deg,
      #c8b05f 0%,      /* Dunkles Kupfer-Gold - LINKS */
      #d4c178 25%,     /* Mittleres Kupfer-Gold */
      #e2d395 40%,     /* Helles Kupfer-Gold */
      #ede2b5 50%,     /* Hellstes Gold-Beige - ZENTRUM/MITTE */
      #e2d395 60%,     /* Helles Kupfer-Gold */
      #d4c178 75%,     /* Mittleres Kupfer-Gold */
      #c8b05f 100%     /* Dunkles Kupfer-Gold - RECHTS */
    );
}

/* Titel und Mana-Kosten über dem Glanz */
.card-title,
.mana-cost {
  position: relative;
  z-index: 2;
}

.card-title {
  flex: 1;
  text-align: left;
  position: relative;
  z-index: 2;
}

.title-text {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 900;  /* Sehr fett wie im Original */
  color: #000000;    /* Tiefschwarz wie echte Karten */

  /* Authentischer Text-Schatten für Lesbarkeit */
  text-shadow:
    1px 1px 0 rgba(255, 255, 255, 0.8),
    0 0 2px rgba(255, 255, 255, 0.6);

  /* Magic-typische Schrift */
  font-family: 'Arial Black', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: 0.02em;
}

/* 2. ARTWORK SECTION - Bildbereich im inneren Rahmen */
.artwork-section {

  margin: 0px 8px 0px 8px;

  position: relative;
  z-index: 9;
  background: #2c2c2c;
  border-radius: 0px;
  overflow: hidden;
  min-height: 280px;

  /* Goldener Rahmen um Artwork mit schwarzem Rand nur links/rechts */
  border: 2px solid rgb(218, 198, 25);
  border-radius: 0px;

  /* Schwarzer Rand + 2px Schatten um die gesamte Artbox */
  box-shadow:
    -2px 0 0 0 #000000,                        /* Linker schwarzer Rand */
    2px 0 0 0 #000000,                         /* Rechter schwarzer Rand */
    0 0 0 2px rgba(0, 0, 0, 0.6),             /* 2px breiter Schatten um die gesamte Artbox */
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 3px 6px rgba(0, 0, 0, 0.2),              /* Äußerer Schatten */
    /* Partielle Schatten oben und unten nur an den Seiten */
    -8px -2px 8px -6px rgba(0, 0, 0, 0.4),    /* Oberer linker Schatten */
    8px -2px 8px -6px rgba(0, 0, 0, 0.4),     /* Oberer rechter Schatten */
    -8px 2px 8px -6px rgba(0, 0, 0, 0.4),     /* Unterer linker Schatten */
    8px 2px 8px -6px rgba(0, 0, 0, 0.4);      /* Unterer rechter Schatten */
}

.artwork-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.artwork-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.artwork-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  background: linear-gradient(135deg, #3c3c3c 0%, #2c2c2c 100%);
  width: 100%;
  height: 180px;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.placeholder-content span {
  font-size: 1.1rem;
  opacity: 0.7;
}

/* SPIELERINFORMATIONEN IM ARTWORK-BEREICH */
.player-info-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 6px;
  background:
    linear-gradient(135deg,
      rgba(140, 120, 90, 0.2) 0%,
      rgba(180, 160, 120, 0.15) 50%,
      rgba(140, 120, 90, 0.2) 100%
    );
}

.players-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  height: 100%;
  justify-content: space-between;
  align-items: stretch;
  padding: 10px;
}

.player-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  width: 100%;
  flex: 1;
  background:
    linear-gradient(135deg,
      rgba(212, 168, 85, 0.25) 0%,     /* Helles Gold transparent */
      rgba(184, 148, 31, 0.2) 50%,     /* Warmes Gold transparent */
      rgba(125, 104, 21, 0.25) 100%    /* Dunkles Gold transparent */
    );
  border: 1px solid rgba(218, 198, 25, 0.5);
  border-radius: 8px;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transition: all 0.2s ease;
  min-height: 5px;
}

.player-card:hover {
  transform: translateY(-1px);
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.player-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  width: 100%;
  align-items: center;
  gap: 8px;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-start;
}.player-icon {
  color: #d4a855;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.player-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #313131;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.deck-separator {
  font-size: 1rem;
  font-weight: bold;
  color: #7d6815;
  text-align: center;
  flex-shrink: 0;
  justify-self: center;
}

.deck-info {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
}

.deck-icon {
  color: #9a7e1a;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.deck-name {
  font-size: 1rem;
  color: #cfa81c;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 3. TYPE LINE - Kartentyp-Zeile im inneren Rahmen */
.type-line {

  position: relative;
  z-index: 10;
  padding: 9px 12px;

  /* Subtiles Kupfer-Gold Type-Line Background - dunkel außen, hell mittig */
  background:
    linear-gradient(90deg,
      #c4b35a 0%,      /* Dunkles warmes Kupfer - LINKS */
      #d8c998 50%,     /* Helles kupfriges Gold-Beige - ZENTRUM/MITTE */
      #c4b35a 100%     /* Dunkles warmes Kupfer - RECHTS */
    );

  /* Goldener Rahmen um Type-Line mit schwarzem Rand nur links/rechts */
  border: 2px solid rgb(218, 198, 25);
  border-radius: 16px; /* Stumpfere Abrundung */

  /* Schwarzer Rand nur links und rechts + STARKER 3D-Absteh-Effekt */
  box-shadow:
    -2px 0 0 0 #000000,                        /* Linker schwarzer Rand */
    2px 0 0 0 #000000,                         /* Rechter schwarzer Rand */
    inset 0 1px 0 rgba(255, 255, 255, 0.3),   /* Innerer Glanz */
    /* OPTIMALER 3D-ABSTEH-EFFEKT - Perfekte Balance */
    0 6px 12px rgba(0, 0, 0, 0.35),           /* Mittlerer tiefer Schatten */
    0 3px 6px rgba(0, 0, 0, 0.45),            /* Sichtbarer Schatten */
    0 1px 3px rgba(0, 0, 0, 0.55);            /* Deutlicher Kontakt-Schatten */

  /* Optimaler physischer Abstand */
  margin: 1px 0px 0px 0px;
  position: relative;
}

.type-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-type {
  font-size: 0.95rem;
  font-weight: bold;
  color: #2c2c2c;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);
}

/* 4. TEXTBOX SECTION - Textfeld im inneren Rahmen */
.textbox-section {

  margin: 1px 8px 0px 8px;

  position: relative;
  z-index: 9;
  flex: 1;
  display: flex;
  flex-direction: column;

  /* Begrenzte Höhe für Magic-Karten-Proportionen */
  min-height: 160px;
  max-height: 260px;
}

.textbox-inner {
  padding: 4px;
  background:
    linear-gradient(180deg,
      #faf8f1 0%,
      #f7f4ea 25%,
      #f4f0e3 50%,
      #f0ebdc 75%,
      #ebe5d5 100%
    );

  /* Goldener Rahmen um Textbox mit schwarzem Rand nur unten/links/rechts */
  border: 2px solid rgb(218, 198, 25);
  border-radius: 0px;

  /* Schwarzer Rand + 2px Schatten um die gesamte Artbox */
  box-shadow:
    -2px 0 0 0 #000000,                        /* Linker schwarzer Rand */
    2px 0 0 0 #000000,                         /* Rechter schwarzer Rand */
    0 0 0 2px rgba(0, 0, 0, 0.6),             /* 2px breiter Schatten um die gesamte Artbox */
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 3px 6px rgba(0, 0, 0, 0.2),              /* Äußerer Schatten */
    /* Partielle Schatten oben und unten nur an den Seiten */
    -8px -2px 8px -6px rgba(0, 0, 0, 0.4),    /* Oberer linker Schatten */
    8px -2px 8px -6px rgba(0, 0, 0, 0.4),     /* Oberer rechter Schatten */
    -8px 2px 8px -6px rgba(0, 0, 0, 0.4),     /* Unterer linker Schatten */
    8px 2px 8px -6px rgba(0, 0, 0, 0.4);      /* Unterer rechter Schatten */

  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;

  /* Automatisches Scrolling - begrenzt auf verfügbaren Platz */
  overflow-y: auto;
  max-height: 260px;  /* Kleinere max-height um in die Karte zu passen */
  min-height: 80px;
}

.card-text {
  font-size: 0.9rem;
  line-height: 1.4;
  color: #2c2c2c;
  margin-bottom: 12px;
  flex: 1;
}

.power-toughness {
  position: absolute;
  bottom: 8px;
  right: 8px;
}

.pt-box {
  background: #f8f4e6;
  border: 2px solid #978B73;
  border-radius: 3px;
  padding: 2px 8px;
  font-weight: bold;
  font-size: 1.1rem;
  color: #2c2c2c;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Mana-Cost Container */
.mana-cost {
  display: flex;
  gap: 2px;  /* Enger zusammen wie im Original */
  align-items: center;
  position: relative;
  z-index: 2;
}

/* Mana-Symbole - Authentisch wie echte Magic-Karten */
.mana-symbol {
  width: 20px;   /* Kleiner und authentischer */
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: default;
  transition: all 0.15s ease;

  /* Echter Magic-Mana-Symbol Look */
  border: 1.5px solid #000000;  /* Schwarzer Rand wie im Original */
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.6),              /* Äußerer Schatten */
    inset 0 1px 1px rgba(255, 255, 255, 0.3),  /* Innerer Highlight */
    inset 0 -1px 1px rgba(0, 0, 0, 0.2);       /* Innerer Schatten */

  /* Subtiler 3D-Effekt */
  position: relative;
}

.mana-symbol:hover {
  transform: scale(1.05);
}

.mana-icon {
  font-size: 12px;  /* Kleinere Icons */
  color: white;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.9),
    0 0 3px rgba(0, 0, 0, 0.6);
  filter: drop-shadow(0 0.5px 1px rgba(0, 0, 0, 0.4));
}

.mana-number {
  font-size: 13px;  /* Kleinere Zahlen */
  font-weight: 900;
  color: white;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.95),
    0 0 4px rgba(0, 0, 0, 0.7);
  font-family: 'Arial Black', Arial, sans-serif;
}

/* Authentische Magic Mana-Farben - exakt wie im Original */
.mana-white {
  background:
    radial-gradient(circle at 35% 25%,
      #ffffff 0%,
      #fffef8 25%,
      #fef8e0 50%,
      #f4e4a6 75%,
      #e6d285 100%
    );
}

.mana-blue {
  background:
    radial-gradient(circle at 35% 25%,
      #7db9e8 0%,
      #5aa7db 25%,
      #3694ce 50%,
      #1381c1 75%,
      #006eb4 100%
    );
}

.mana-black {
  background:
    radial-gradient(circle at 35% 25%,
      #5a5a5a 0%,
      #3a3a3a 25%,
      #2a2a2a 50%,
      #1a1a1a 75%,
      #000000 100%
    );
}

.mana-red {
  background:
    radial-gradient(circle at 35% 25%,
      #ff6b47 0%,
      #e85438 25%,
      #d13c29 50%,
      #ba241a 75%,
      #a30c0b 100%
    );
}

.mana-green {
  background:
    radial-gradient(circle at 35% 25%,
      #7bc06c 0%,
      #5eb04f 25%,
      #409f32 50%,
      #228e15 75%,
      #047d00 100%
    );
}

.mana-colorless {
  background:
    radial-gradient(circle at 35% 25%,
      #c5c5c5 0%,
      #adadad 25%,
      #959595 50%,
      #7d7d7d 75%,
      #656565 100%
    );
}

/* Numeric Mana - grauer Gradient wie Colorless */
.mana-0, .mana-1, .mana-2, .mana-3, .mana-4, .mana-5, .mana-6,
.mana-7, .mana-8, .mana-9, .mana-10, .mana-11, .mana-12, .mana-13,
.mana-14, .mana-15, .mana-16 {
  background:
    radial-gradient(circle at 35% 25%,
      #c5c5c5 0%,
      #adadad 25%,
      #959595 50%,
      #7d7d7d 75%,
      #656565 100%
    );
}

/* Universeller Magic-Karten-Rand für alle Varianten */
.magic-card-border {
  padding: 0;
  border-radius: 12px;
  position: relative;

  /* Maximale Breite für authentische Magic-Karten-Proportionen */
  max-width: 500px;
  min-height: 700px;
  aspect-ratio: 5/7; /* Authentisches Kartenverhältnis 5:7 */
  margin: 0 auto;  /* Zentriert den Container horizontal */

  /* Authentischer schwarzer Magic-Karten-Rand */
  border: 12px solid #000000;

  /* Dramatische Schatten für Tiefe */
  box-shadow:
    /* Äußere Schatten */
    0 8px 25px rgba(0, 0, 0, 0.4),
    0 4px 15px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.2);

  overflow: hidden;

  /* ULTRA-INTENSIVE STEINOBERFLÄCHE MIT MAXIMALER TEXTUR */
  background:
    /* Komplexe Riss-Netzwerke */
    linear-gradient(45deg, transparent 48%, rgba(0, 0, 0, 0.4) 49%, rgba(0, 0, 0, 0.4) 51%, transparent 52%),
    linear-gradient(135deg, transparent 47%, rgba(0, 0, 0, 0.3) 48%, rgba(0, 0, 0, 0.3) 52%, transparent 53%),
    linear-gradient(22deg, transparent 46%, rgba(0, 0, 0, 0.25) 47%, rgba(0, 0, 0, 0.25) 53%, transparent 54%),
    linear-gradient(67deg, transparent 45%, rgba(0, 0, 0, 0.2) 46%, rgba(0, 0, 0, 0.2) 54%, transparent 55%),
    linear-gradient(112deg, transparent 44%, rgba(0, 0, 0, 0.18) 45%, rgba(0, 0, 0, 0.18) 55%, transparent 56%),
    linear-gradient(156deg, transparent 43%, rgba(0, 0, 0, 0.15) 44%, rgba(0, 0, 0, 0.15) 56%, transparent 57%),

    /* Massive Steinformationen und Kristallstrukturen */
    radial-gradient(ellipse at 15% 25%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 20%, transparent 45%),
    radial-gradient(ellipse at 85% 15%, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.12) 25%, transparent 50%),
    radial-gradient(ellipse at 70% 75%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.08) 30%, transparent 60%),
    radial-gradient(ellipse at 25% 85%, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0.1) 35%, transparent 65%),
    radial-gradient(ellipse at 50% 10%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 40%, transparent 70%),
    radial-gradient(ellipse at 90% 50%, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.08) 45%, transparent 75%),
    radial-gradient(ellipse at 10% 90%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 80%),

    /* Große Steinbrocken und Klumpen */
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 15%, transparent 35%),
    radial-gradient(circle at 75% 30%, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.08) 20%, transparent 40%),
    radial-gradient(circle at 45% 65%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 25%, transparent 45%),
    radial-gradient(circle at 90% 80%, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0.06) 28%, transparent 50%),
    radial-gradient(circle at 10% 70%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.04) 30%, transparent 55%),
    radial-gradient(circle at 60% 10%, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.04) 32%, transparent 60%),
    radial-gradient(circle at 80% 60%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 35%, transparent 65%),
    radial-gradient(circle at 20% 40%, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.03) 38%, transparent 70%),

    /* Mittlere Steinkörnungen - mehr Dichte */
    radial-gradient(circle at 22% 45%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 12%, transparent 25%),
    radial-gradient(circle at 78% 55%, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.04) 15%, transparent 30%),
    radial-gradient(circle at 35% 75%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 18%, transparent 35%),
    radial-gradient(circle at 65% 25%, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.03) 20%, transparent 40%),
    radial-gradient(circle at 88% 45%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 22%, transparent 45%),
    radial-gradient(circle at 12% 55%, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.02) 25%, transparent 50%),
    radial-gradient(circle at 55% 85%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 28%, transparent 55%),
    radial-gradient(circle at 45% 15%, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.01) 30%, transparent 60%),

    /* Feine Steinkörnungen - maximale Dichte */
    radial-gradient(circle at 33% 33%, rgba(255, 255, 255, 0.06) 0%, transparent 15%),
    radial-gradient(circle at 67% 67%, rgba(0, 0, 0, 0.06) 0%, transparent 18%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 12%),
    radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.05) 0%, transparent 15%),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.04) 0%, transparent 10%),
    radial-gradient(circle at 85% 35%, rgba(0, 0, 0, 0.04) 0%, transparent 12%),
    radial-gradient(circle at 15% 65%, rgba(255, 255, 255, 0.03) 0%, transparent 8%),
    radial-gradient(circle at 95% 85%, rgba(0, 0, 0, 0.03) 0%, transparent 10%),
    radial-gradient(circle at 5% 15%, rgba(255, 255, 255, 0.03) 0%, transparent 8%),
    radial-gradient(circle at 75% 95%, rgba(0, 0, 0, 0.03) 0%, transparent 10%),
    radial-gradient(circle at 25% 5%, rgba(255, 255, 255, 0.02) 0%, transparent 6%),
    radial-gradient(circle at 65% 45%, rgba(0, 0, 0, 0.02) 0%, transparent 8%),
    radial-gradient(circle at 35% 85%, rgba(255, 255, 255, 0.02) 0%, transparent 6%),
    radial-gradient(circle at 55% 25%, rgba(0, 0, 0, 0.02) 0%, transparent 8%),
    radial-gradient(circle at 15% 45%, rgba(255, 255, 255, 0.02) 0%, transparent 5%),
    radial-gradient(circle at 85% 75%, rgba(0, 0, 0, 0.02) 0%, transparent 7%),

    /* Mikro-Steinstrukturen für extreme Textur */
    radial-gradient(circle at 42% 28%, rgba(255, 255, 255, 0.02) 0%, transparent 4%),
    radial-gradient(circle at 58% 72%, rgba(0, 0, 0, 0.02) 0%, transparent 5%),
    radial-gradient(circle at 38% 38%, rgba(255, 255, 255, 0.015) 0%, transparent 3%),
    radial-gradient(circle at 62% 62%, rgba(0, 0, 0, 0.015) 0%, transparent 4%),
    radial-gradient(circle at 48% 18%, rgba(255, 255, 255, 0.015) 0%, transparent 3%),
    radial-gradient(circle at 52% 82%, rgba(0, 0, 0, 0.015) 0%, transparent 4%),
    radial-gradient(circle at 28% 68%, rgba(255, 255, 255, 0.01) 0%, transparent 2%),
    radial-gradient(circle at 72% 32%, rgba(0, 0, 0, 0.01) 0%, transparent 3%),
    radial-gradient(circle at 18% 28%, rgba(255, 255, 255, 0.01) 0%, transparent 2%),
    radial-gradient(circle at 82% 72%, rgba(0, 0, 0, 0.01) 0%, transparent 3%),

    /* Basis Gold-Orange Gradient für warme Steinstruktur */
    linear-gradient(135deg,
      #d4a855 0%,     /* Helles Gold */
      #b8941f 20%,    /* Warmes Gold */
      #9a7e1a 40%,    /* Tiefes Gold */
      #7d6815 60%,    /* Dunkles Gold-Orange */
      #5f4e10 80%,    /* Sehr dunkles Gold-Orange */
      #3d320a 100%    /* Tiefster warmer Steinton */
    );

  /* Angepasste Filter für warme Gold-Orange Steinoptik */
  filter:
    contrast(1.2)           /* Guter Kontrast für warme Töne */
    brightness(1.15)        /* Heller für bessere Sichtbarkeit */
    saturate(1.1)          /* Etwas mehr Sättigung für warme Farben */
    sepia(0.1)             /* Mehr Erdton für Gold-Optik */
    hue-rotate(-5deg);     /* Leichte Verschiebung zu warmen Tönen */
}

/* Responsive */
@media (max-width: 575.98px) {
  .responsive-container {
    padding: 0 0.5rem;
  }

  .variant-card,
  .variant-sidebar {
    max-width: 100%;
  }

  .magic-header {
    padding: 8px 12px;
    /* BEHALTEN: flex-direction: row für Name und Mana-Kosten in einer Zeile */
    flex-wrap: wrap;        /* Erlaubt Umbruch wenn nötig, aber versucht eine Zeile */
    align-items: center;    /* Zentriert vertikal */
    gap: 8px;              /* Abstand zwischen Elementen */
  }

  .card-title {
    text-align: left;      /* Links ausrichten auf kleinen Bildschirmen */
    flex: 1;              /* Nimmt verfügbaren Platz, aber lässt Platz für Mana-Kosten */
    min-width: 0;         /* Verhindert Overflow-Probleme */
  }

  .title-text {
    font-size: 1.2rem;
  }

  .mana-cost {
    justify-content: flex-end;  /* Rechts ausrichten für bessere Platznutzung */
    flex-shrink: 0;            /* Verhindert Schrumpfen der Mana-Kosten */
  }

  .mana-symbol {
    width: 28px;
    height: 28px;
  }

  .mana-icon {
    font-size: 14px;
  }

  .mana-number {
    font-size: 16px;
  }
}

@media (min-width: 992px) {
  .title-text {
    font-size: 1.5rem;
  }

  .mana-symbol {
    width: 36px;
    height: 36px;
  }

  .mana-icon {
    font-size: 18px;
  }

  .mana-number {
    font-size: 20px;
  }
}
</style>
