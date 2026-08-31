# シャサフ式高次元音程→平均律近似計算機 / shasavistic_to_12n-edo_converter

For English users: Please scroll down for the English description.

---

## 概要

シャサフ式音楽理論における高次元音程の計算および、任意の $n$-EDO（平均律）への近似計算を行うWebベースの計算ツールです。  
12*n EDO（12の倍数分割の平均律）における「音名 + ステップ数」表記をサポートしており、従来の12平均律向けDAWや五線譜におけるピッチベンド・臨時記号の調整を直感的に行えます。

## 主な機能

- **シャサフ式音程計算**
  - 1次元〜6次元の音程要素（1:2, 2:3, 4:5, 4:7など）の増減による周波数倍率計算
- **平均律変換・誤差表示**
  - 任意の平均律（$n$-EDO）および基準ピッチ（Hz）への対応
- **12*n EDO「音名 + ステップ数」表示**
  - 12音律からの偏差をステップ数で表示し、DAWや楽譜作成ソフトへの入力を補助
  - ※分割数が12の倍数である平均律に設定したときのみ利用可能な機能です。
- **多言語表記切り替え**
  - 英米式 (A, B, C)、ドイツ式 (A, H, C)、日本式 (イ, ロ, ハ) の音名表記に対応
  - 英米式とドイツ式は優先する表記の切り替えが可能
- **音声試聴**
  - Web Audio APIによる根音と計算結果音程の試聴機能

## 使い方

1. **基本設定**
   - 基準ピッチ（例: 440Hz）、根音、主音、平均律の分割数（EDO）を設定します。
   - 主音は音名を入力した後、「↑」「↓」ボタンで1次元の上昇・下降（オクターブ位置の調整）が可能です。
2. **音程入力**
   - 各次元の「↑」「↓」ボタンを押して、計算したい音程の次元要素を選択します。
3. **結果確認**
   - 画面下に算出された周波数、音名、平均律のステップ数・セント差が表示されます。
   - 「試聴」ボタンを押すと実際の響きを確認できます。

## 技術構成

- **HTML5 / CSS3**
- **JavaScript (ES6+)**
- **Web Audio API**

## クレジット・ライセンス

このプロジェクトは個人の音楽理論研究・ツール開発のために作成されています。  
また、本ツールは LΛMPLIGHT 氏による「シャサフ式音楽理論」および関連するデザインをもとに作成されました。

- **理論・原案・デザイン**: LΛMPLIGHT

---

# English Description

## Overview

This is a web-based calculator for high-dimensional intervals in Shasavistic music theory and their conversion to arbitrary $n$-EDO.  
By supporting "Note + Step" notation for 12*n EDOs, it simplifies pitch-bend and accidental adjustments in standard 12-EDO DAWs and traditional staff notation.

## Features

- **Shasavistic Interval Calculations**
  - Frequency multiplier calculation by adjusting 1D to 6D interval elements (1:2, 2:3, 4:5, 4:7, etc.).
- **Custom EDO Conversions & Error Display**
  - Support for custom $n$-EDOs and base pitch (Hz) settings.
- **12*n EDO "Note + Step" Notation**
  - Displays deviation from standard 12-EDO in steps to assist entry into DAWs and notation software.
  - *This feature is available only when the EDO division count is a multiple of 12.
- **Multi-language Notation**
  - Switch between English (A, B, C), German (A, H, C), and Japanese (イ, ロ, ハ) note names.
  - Priority notation settings can be toggled for English and German modes.
- **Audio Playback**
  - Audition root notes and calculated target intervals using the Web Audio API.

## Usage

1. **Base Settings**
   - Set the base pitch (e.g., 440Hz), root note, tonic, and EDO division count.
   - For the tonic, after entering the note name, use the "↑" and "↓" buttons to adjust 1D octave shifts.
2. **Dimensional Input**
   - Click the "↑" and "↓" buttons for each dimension to select interval components.
3. **Result & Playback**
   - View the calculated frequency, note name, EDO step offset, and cent deviation at the bottom of the screen.
   - Click the audition button to listen to the calculated interval.

## Technologies Used

- **HTML5 / CSS3**
- **JavaScript (ES6+)**
- **Web Audio API**

## Credits & License

This project was created for personal music theory research and tool development.  
It is built based on "Shasavistic Music Theory" and related designs created by LΛMPLIGHT.

- **Theory, Original Concept, and Design**: LΛMPLIGHT
