# Release Notes

---

## [v1.0.1] - 2026-09-03

### Summary of Changes
- **New Offsets & Persistence:** Added $n$-EDO step offset support for both Base Pitch Note and Tonic, ensuring values persist via `localStorage` and reset correctly.
- **Reference Pitch Standardization:** Standardized the note-plus-step display reference to absolute A=440 Hz pitch.
- **Offset Normalization:** Implemented automatic offset normalization to convert negative offsets into equivalent positive offsets with lower note names (e.g., `[A# - <sup>48</sup>2']` → `[A + <sup>48</sup>2']`).
- **Bug Fixes:** Resolved multiple display and calculation errors, including incorrect note labeling under Tonic offsets, duplicate `tonic_step_12` calculations, relative $n$-EDO step reference point issues, negative offset display errors, and octave normalization inconsistencies.

### 🌟 Added
- Added Base Pitch Note offset support for $n$-EDO step values.
- Added Tonic offset support for $n$-EDO step values.
- Persisted both Base Pitch and Tonic offsets through page resets and `localStorage` settings.

### 🔄 Changed
- Separated absolute note-name detection from Tonic offsets.
- Updated note-plus-step display to use absolute A=440 Hz pitch as its note-name reference.
- Added automatic offset normalization to prefer positive offsets with the lower note name (e.g., `[A# - <sup>48</sup>2']` becomes `[A + <sup>48</sup>2']`).

### 🐛 Fixed
- Updated relative $n$-EDO step calculations (when note-plus-step display is OFF) to correctly use the Tonic frequency as reference.
- Fixed 440 Hz incorrectly displaying as `[G#]` when Tonic was set to `A + <sup>48</sup>4'`.
- Fixed a bug where `tonic_step_12` was doubly added inside `calc_nedo_step_and_cents()`, causing shifted note displays for non-A Tonics (e.g., displaying `[D#]` instead of `[C]`).
- Fixed negative wrapped offsets being displayed against the wrong note name.
- Kept octave normalization consistent between the internal base pitch and Tonic reference.

---

## [v1.0.0] - Initial Release

First official release of the Shasavistic Interval to $12n$-EDO Converter.

### 🎵 Key Features
- **Shasavistic Theory Interval Calculation:** Compute frequencies and high-dimensional interval vector pitches based on Shasavistic theory.
- **$12n$-EDO Note Mapping:** Map calculated frequencies to $12n$-EDO steps with clear 12-tone note name detection and cent deviation.
- **Interactive UI & Custom Controls:**
  - Dynamic input controls for multi-dimensional interval counts.
  - Configurable Base Pitch ($A=440$ Hz standard), Base Note, and Equal Temperament ($n$-EDO) settings.
  - Interactive SVG visualizer displaying vector movements.
- **Audio Synthesis:** Built-in Web Audio API preview to listen to base pitch and calculated interval frequencies.
- **Local Persistence:** Save and reload custom settings directly via browser `localStorage`.
