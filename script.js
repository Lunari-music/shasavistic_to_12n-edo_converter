document.addEventListener('DOMContentLoaded', () => {
// ==========================================
// 1. DOM要素の取得
// ==========================================

// --- 入力・設定関連 ---
const input_n_edo = document.getElementById('base-edo');
const input_base_pitch = document.getElementById('base-pitch');
const input_base_note = document.getElementById('base-note');
const input_base_note_offset = document.getElementById('base-note-offset');
const input_base_tonic = document.getElementById('base-scale-tonic');
const chk_show_note_with_step = document.getElementById('show-note-with-step');
const select_notation_mode = document.getElementById('notation-mode');
const play_note_interval = document.getElementById('btn-play-audio');
const reset_inputed_interval = document.getElementById('btn-reset-interval');
const reset_scale = document.getElementById('btn-reset-scale');
const btn_base_1d_up = document.getElementById('base-1d-up');
const btn_base_1d_down = document.getElementById('base-1d-down');

// --- カード（次元入力）関連 ---
const cards = document.querySelectorAll('.interval-input-card');

// --- 表示領域関連 ---
const display_for_offset_n_edo = document.getElementById('for-offset-n-edo');
const display_tonic_pitch = document.getElementById('base-scale-tonic-pitch');
const display_for_result_scale = document.getElementById('result-base-scale');
const display_for_result_base_note = document.getElementById('result-base-note-input');
const output_result_base_note = document.getElementById('result-base-note-output');
const display_for_result_interval = document.getElementById('result-interval-input');
const output_result_interval_mult = document.getElementById('result-interval-mult');
const output_result_interval = document.getElementById('result-interval-output');


// ==========================================
// 2. 状態管理変数・定数定義
// ==========================================

// --- アプリケーション設定値 ---
let base_pitch = 440.00;
let base_note_str = "A";
let base_note_offset = 0;
let n_edo = 48;
let base_octave_shift_count = 0;

// --- 監視対象入力エレメント群 ---
const inputElements = [
  input_n_edo,
  input_base_pitch,
  input_base_note,
  input_base_note_offset,
  input_base_tonic,
  chk_show_note_with_step,
  select_notation_mode
];

// --- 高次元音程設定データ ---
const dim_to_numerators = [2, 3, 5, 7, 11, 13];
const dim_to_denominators = [1, 2, 4, 4, 4, 4];
const intervalCounts = [0, 0, 0, 0, 0, 0];

// --- 設定保存用キー ---
const STORAGE_KEY = 'shasafu_settings_v1';

// --- 音名変換テーブル（12音律） ---
const note_to_12step_deu = [
  ['A','Gisis','Bes'],
  ['Ais','B','Ceses'],
  ['H','Ces','Aisis'],
  ['C','His','Deses'],
  ['Cis','Des','Hisis'],
  ['D','Cisis','Eses'],
  ['Dis','Es','Feses'],
  ['E','Fes','Disis'],
  ['F','Eis','Geses'],
  ['Fis','Ges','Eisis'],
  ['G','Fisis','Ases'],
  ['Gis','As']
];

const note_to_12step_en = [
  ['A'],              
  ['A#', 'Bb'],       
  ['B', 'Cb'],
  ['C', 'B#'],        
  ['C#', 'Db'],       
  ['D'],              
  ['D#', 'Eb'],       
  ['E', 'Fb'],        
  ['F', 'E#'],        
  ['F#', 'Gb'],       
  ['G'],              
  ['G#', 'Ab']
];

const note_to_12step_ja = [
  ['イ', '重嬰ト', '重変ロ'],
  ['嬰イ', '変ロ', '重変ハ'],
  ['ロ', '変ハ', '重嬰イ'],
  ['ハ', '重嬰ロ', '重変ニ'],
  ['嬰ハ', '変ニ', '重嬰ロ'],
  ['ニ', '重嬰ハ', '重変ホ'],
  ['嬰ニ', '変ホ', '重変ヘ'],
  ['ホ', '変ヘ', '重嬰ニ'],
  ['ヘ', '重嬰ホ', '重変ト'],
  ['嬰ヘ', '変ト', '重嬰ホ'],
  ['ト', '重嬰ヘ', '重変イ'],
  ['嬰ト', '変イ']
];

// --- 言語別テーブルのまとめ（重複していた [deu, en, ja] を一箇所に集約） ---
const NOTE_TABLES = [note_to_12step_deu, note_to_12step_en, note_to_12step_ja];


// ==========================================
// 3. イベントリスナー登録
// ==========================================

cards.forEach((card, index) => {
  const upBtn = card.querySelector('button[id$="-up"]');
  const downBtn = card.querySelector('button[id$="-down"]');
  const display = card.querySelector('.card-row:last-child p');
  const dimIndex = index + 1; // 1〜6次元

  if (upBtn && downBtn) {
    upBtn.addEventListener('click', () => {
      intervalCounts[index]++;
      render_card_display(display, dimIndex, intervalCounts[index]);
      update_all();
    });

    downBtn.addEventListener('click', () => {
      intervalCounts[index]--;
      render_card_display(display, dimIndex, intervalCounts[index]);
      update_all();
    });
  }
});

// 各入力要素のリアルタイム入力・変更イベント設定（changeを追加）
inputElements.forEach(element => {
  if (element) {
    element.addEventListener('input', update_all);
    element.addEventListener('change', update_all);
  }
});

// 音声再生ボタンのクリックイベント
if (play_note_interval) {
  play_note_interval.addEventListener('click', () => {
    playCurrentResultAudio();
  });
}

// 設定リセットボタンのクリックイベント
if (reset_scale) {
  reset_scale.addEventListener('click', () => {
    reset_base_scale_settings();
  });
}

// 音程リセットボタンのクリックイベント
if (reset_inputed_interval) {
  reset_inputed_interval.addEventListener('click', () => {
    reset_interval_counts();
  });
}

// 主音1次元（オクターブ）上昇・下降ボタンイベント
if (btn_base_1d_up) {
  btn_base_1d_up.addEventListener('click', () => {
    base_octave_shift_count++;
    update_all();
  });
}

if (btn_base_1d_down) {
  btn_base_1d_down.addEventListener('click', () => {
    base_octave_shift_count--;
    update_all();
  });
}


// ==========================================
// 4. メイン更新処理・計算関数
// ==========================================

/**
 * 画面上の全ての計算結果および表示情報を一括更新します。
 */
function update_all() {
  validate_inputs();
  update_input();
  
  // 分数テキストの更新
  output_result_interval_mult.textContent = calc_all_mult_text(intervalCounts);
  
  // 数値倍率の計算と周波数出力
  const mult_val = calc_all_mult_value(intervalCounts);
  calc_result(mult_val);

  // 現在の設定を保存
  save_settings_to_storage();
}

/**
 * 入力フォームの値を取得して状態変数を更新し、オクターブ調整および表示を更新します。
 * @returns {number} シフト調整後の主音周波数
 */
function update_input() {
  const raw_pitch = parseFloat(input_base_pitch.value) || 440;
  base_note_str = input_base_note.value.trim();
  base_note_offset = parseInt(input_base_note_offset.value, 10) || 0;
  n_edo = parseInt(input_n_edo.value, 10) || 48;

  // 1. 主音（Tonic）の周波数をシフトカウント（×2^n）を反映して計算
  const tonic_str = input_base_tonic.value.trim();
  const { step: tonic_step } = parse_note_info(tonic_str);
  const base_tonic_pitch = raw_pitch * Math.pow(2, tonic_step / 12);
  const shifted_tonic_pitch = base_tonic_pitch * Math.pow(2, base_octave_shift_count);

  // 2. 基音の周波数が (主音/(4/3), 主音*(3/2)) の範囲に入るよう 2^n 倍で調整
  const lower_bound = shifted_tonic_pitch / (4 / 3); // 下限：主音 * (3/4) = 主音 / (4/3)
  const upper_bound = shifted_tonic_pitch * 1.5;     // 上限：主音 * (3/2)

  // 境界線の音（G音など）が計算誤差で跳ねないよう、許容誤差を約10セント（周波数の約0.5%）に設定
  const epsilon = shifted_tonic_pitch * 0.005;

  let adjusted_pitch = raw_pitch;
  if (shifted_tonic_pitch > 0 && adjusted_pitch > 0) {
    while (adjusted_pitch <= lower_bound + epsilon) {
      adjusted_pitch *= 2;
    }
    // 上限側のイコール条件を外すか、十分に誤差を引いて比較
    while (adjusted_pitch >= upper_bound + epsilon) {
      adjusted_pitch *= 0.5;
    }
  }
  base_pitch = adjusted_pitch;

  display_for_offset_n_edo.textContent = n_edo;
  display_for_result_scale.textContent = `結果(A=${base_pitch.toFixed(2)}Hz,${n_edo}edo)`;
  
  // 主音表示の更新
  display_tonic_pitch.textContent = `(=${shifted_tonic_pitch.toFixed(2)}Hz)`;

  return shifted_tonic_pitch;
}

/**
 * 高次元音程倍率をもとに目標周波数を計算し、結果画面を出力・更新します。
 * @param {number} mult - 計算された合成倍率（数値）
 */
function calc_result(mult) {
  const tonic_pitch = base_pitch;

  // 1. 基音の解析
  const { step: base_step } = parse_note_info(base_note_str);
  
  // 2. 周波数計算
  const total_12step_offset = base_step + (base_note_offset * (12 / n_edo));
  const actual_base_pitch = base_pitch * Math.pow(2, total_12step_offset / 12);
  const target_pitch = actual_base_pitch * mult;

  // 3. 基音のオフセット文字列を作成
  let offset_text = "";
  if (base_note_offset !== 0) {
    const sign = base_note_offset > 0 ? "+" : "";
    offset_text = ` ${sign} <sup>${n_edo}</sup>${base_note_offset}'`;
  }

  // 4. 音名・近似値計算（選択された表記言語を優先適用）
  const activeLang = get_selected_lang_index();
  const base_note_cents_info = get_closest_note_and_cents(actual_base_pitch, activeLang);
  const target_12edo_info = get_closest_note_and_cents(target_pitch, activeLang);
  const nedo_info = calc_nedo_step_and_cents(target_pitch, tonic_pitch, n_edo, activeLang);

  // 5. 画面表示の更新
  display_for_result_base_note.innerHTML = `${base_note_str}${offset_text}`;
  output_result_base_note.textContent = `${base_note_cents_info} (${actual_base_pitch.toFixed(2)}Hz)`;
  
  const raw_symbol_text = get_current_interval_symbol();

  display_for_result_interval.innerHTML = replace_dim_symbols_with_images(raw_symbol_text);
  output_result_interval.innerHTML = `${target_12edo_info} ${nedo_info.formatted_text} (${target_pitch.toFixed(2)}Hz)`;
}

// ==========================================
// リセット処理関数
// ==========================================

/**
 * 画面上部の「基本設定」および1次元シフト回数を初期値に戻します。
 */
function reset_base_scale_settings() {
  input_n_edo.value = 48;
  input_base_pitch.value = 440;
  input_base_note.value = "A";
  input_base_note_offset.value = 0;
  input_base_tonic.value = "A";
  
  // ★ 12平均律の時に音名+ステップ表示: ON (true) に変更
  chk_show_note_with_step.checked = true;

  // ★ 表記モード: 英米式 (english) に変更
  if (select_notation_mode) {
    select_notation_mode.value = "english";
  }

  // オクターブ操作カウントのリセット
  base_octave_shift_count = 0;

  update_all();
}

/**
 * 各次元カードの音程入力状態（矢印選択数）をすべて0にリセットし、カード表示と結果を再計算します。
 */
function reset_interval_counts() {
  for (let i = 0; i < intervalCounts.length; i++) {
    intervalCounts[i] = 0;
  }

  cards.forEach((card) => {
    const display = card.querySelector('.card-row:last-child p');
    if (display) {
      display.innerHTML = "-";
    }
  });

  update_all();
}


// ==========================================
// 4.5 入力バリデーション
// ==========================================

/**
 * 文字列が整数表記（先頭ゼロ・符号つきを許容）として妥当かどうかを判定します。
 * 例: "48", "048", "-3", "007" はOK。 "4.5", "4a", "" はNG。
 * @param {string} str - 判定対象の文字列
 * @param {boolean} allowNegative - 負の数を許容するかどうか
 * @returns {boolean} 整数として妥当なら true
 */
function is_valid_integer_string(str, allowNegative = false) {
  if (str === "") return false;
  const pattern = allowNegative ? /^-?\d+$/ : /^\d+$/;
  return pattern.test(str);
}

/**
 * 音名文字列が、いずれかの言語テーブルに存在する有効な音名かどうかを判定します。
 * @param {string} note_str - 判定対象の文字列
 * @returns {boolean} 有効な音名であれば true
 */
function is_valid_note_name(note_str) {
  if (!note_str) return false;
  return NOTE_TABLES.some(table => table.some(names => names.includes(note_str)));
}

/**
 * 主要な入力欄の値を検証し、不正な場合は赤枠（.input-error）を付与します。
 * 計算処理自体は止めず、視覚的な警告のみを行います。
 * 先頭ゼロ（例: "048"）は許容します。
 * @returns {boolean} すべての項目が有効なら true
 */
function validate_inputs() {
  let all_valid = true;

  // EDO：1以上の整数（先頭ゼロ許容、符号なし）
  const edo_raw = input_n_edo.value.trim();
  const edo_ok = is_valid_integer_string(edo_raw, false) && parseInt(edo_raw, 10) >= 1;
  input_n_edo.classList.toggle('input-error', !edo_ok);
  all_valid = all_valid && edo_ok;

  // 基準ピッチ：正の数
  const pitch_val = parseFloat(input_base_pitch.value);
  const pitch_ok = input_base_pitch.value.trim() !== "" && !isNaN(pitch_val) && pitch_val > 0;
  input_base_pitch.classList.toggle('input-error', !pitch_ok);
  all_valid = all_valid && pitch_ok;

  // 根音：有効な音名
  const note_ok = is_valid_note_name(input_base_note.value.trim());
  input_base_note.classList.toggle('input-error', !note_ok);
  all_valid = all_valid && note_ok;

  // 主音：有効な音名
  const tonic_ok = is_valid_note_name(input_base_tonic.value.trim());
  input_base_tonic.classList.toggle('input-error', !tonic_ok);
  all_valid = all_valid && tonic_ok;

  // 根音オフセット：整数（先頭ゼロ許容、符号つきOK）
  const offset_raw = input_base_note_offset.value.trim();
  const offset_ok = is_valid_integer_string(offset_raw, true);
  input_base_note_offset.classList.toggle('input-error', !offset_ok);
  all_valid = all_valid && offset_ok;

  return all_valid;
}


// ==========================================
// 4.6 設定の保存・復元（localStorage）
// ==========================================

/**
 * 現在の入力状態をlocalStorageへ保存します。
 */
function save_settings_to_storage() {
  try {
    const data = {
      n_edo: input_n_edo.value,
      base_pitch: input_base_pitch.value,
      base_note: input_base_note.value,
      base_note_offset: input_base_note_offset.value,
      base_tonic: input_base_tonic.value,
      show_note_with_step: chk_show_note_with_step.checked,
      notation_mode: select_notation_mode ? select_notation_mode.value : undefined,
      base_octave_shift_count: base_octave_shift_count,
      intervalCounts: intervalCounts
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // プライベートブラウジング等でlocalStorageが使えない場合は黙って無視
    console.warn('設定の保存に失敗しました:', e);
  }
}

/**
 * localStorageから前回の設定を読み込み、画面に反映します。
 * ページ読み込み時に一度だけ呼び出します。
 */
function load_settings_from_storage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);

    if (data.n_edo !== undefined) input_n_edo.value = data.n_edo;
    if (data.base_pitch !== undefined) input_base_pitch.value = data.base_pitch;
    if (data.base_note !== undefined) input_base_note.value = data.base_note;
    if (data.base_note_offset !== undefined) input_base_note_offset.value = data.base_note_offset;
    if (data.base_tonic !== undefined) input_base_tonic.value = data.base_tonic;
    if (data.show_note_with_step !== undefined) chk_show_note_with_step.checked = !!data.show_note_with_step;
    if (data.notation_mode !== undefined && select_notation_mode) select_notation_mode.value = data.notation_mode;
    if (typeof data.base_octave_shift_count === 'number') base_octave_shift_count = data.base_octave_shift_count;

    if (Array.isArray(data.intervalCounts)) {
      data.intervalCounts.forEach((count, i) => {
        if (i < intervalCounts.length && typeof count === 'number') {
          intervalCounts[i] = count;
        }
      });

      // 各カードの表示テキストを復元
      cards.forEach((card, index) => {
        const display = card.querySelector('.card-row:last-child p');
        const dimIndex = index + 1;
        render_card_display(display, dimIndex, intervalCounts[index]);
      });
    }
  } catch (e) {
    console.warn('設定の読み込みに失敗しました:', e);
  }
}

/**
 * 次元カードの表示テキストを、指定したカウント数に応じて更新します。
 * （ボタン操作時と保存復元時の両方から呼べるよう共通化）
 * @param {HTMLElement} display - 表示先の要素
 * @param {number} dimIndex - 次元番号（1〜6）
 * @param {number} count - 現在のカウント数
 */
function render_card_display(display, dimIndex, count) {
  if (!display) return;
  if (count !== 0) {
    const rawText = `${dimIndex}<sup>${gen_arrow_repeated(count, dimIndex)}</sup>`;
    display.innerHTML = replace_dim_symbols_with_images(rawText);
  } else {
    display.innerHTML = "-";
  }
}

/**
 * 現在選択されている表記モードから言語インデックスを取得します。
 * @returns {number} 0: 独(deu), 1: 英(en), 2: 和(ja)
 */
function get_selected_lang_index() {
  if (!select_notation_mode) return 1; // デフォルトは英語
  const mode = select_notation_mode.value;
  if (mode === 'german' || mode === 'deu') return 0;
  if (mode === 'japanese' || mode === 'ja') return 2;
  return 1; // english / en
}

// ==========================================
// 5. 音律・ピッチ計算ヘルパー関数
// ==========================================

/**
 * 各次元の選択回数から合計の実数倍率を算出します。
 * @param {number[]} array_count - 各次元の選択数配列
 * @returns {number} 合計数値倍率
 */
function calc_all_mult_value(array_count) {
  let mult = 1;
  for (let i = 0; i < array_count.length; i++) {
    const count = array_count[i];
    const ratio = dim_to_numerators[i] / dim_to_denominators[i];
    mult *= Math.pow(ratio, count);
  }
  return mult;
}

/**
 * 周波数から最も近い12平均律の音名とセント差を取得します。
 * @param {number} pitch - 算出周波数
 * @param {number} langIndex - 言語インデックス (0:独, 1:英, 2:和)
 * @returns {string} 音名表記とセント差
 */
function get_closest_note_and_cents(pitch, langIndex) {
  const semitones_from_A4 = 12 * Math.log2(pitch / 440);
  let rounded_semitones = Math.round(semitones_from_A4);
  let cents_offset = Math.round((semitones_from_A4 - rounded_semitones) * 100);

  if (cents_offset === -50) {
    cents_offset = 50;
    rounded_semitones -= 1;
  }

  const note_index = ((rounded_semitones % 12) + 12) % 12;

  const target_table = NOTE_TABLES[langIndex] || note_to_12step_en;
  const note_name = target_table[note_index][0];

  let cents_str = "";
  if (cents_offset > 0) {
    cents_str = ` +${cents_offset}¢`;
  } else if (cents_offset < 0) {
    cents_str = ` ${cents_offset}¢`;
  }

  return `${note_name}${cents_str}`;
}

/**
 * 主音の周波数を基準として指定N-EDOにおける近似ステップ数およびセント差を計算します。
 * @param {number} target_pitch - 目標周波数
 * @param {number} tonic_pitch - 主音周波数
 * @param {number} n_edo - 平均律の分割数
 * @param {number} langIndex - 言語インデックス
 * @returns {Object} ステップ数、セント差、成形後のフォーマット文字列
 */
function calc_nedo_step_and_cents(target_pitch, tonic_pitch, n_edo, langIndex) {
  const total_cents = 1200 * Math.log2(target_pitch / tonic_pitch);
  const step_cents = 1200 / n_edo;
  
  let raw_step = Math.round(total_cents / step_cents);
  let cents_offset = Math.round(total_cents - (raw_step * step_cents));

  const half_step_cents = step_cents / 2;
  if (cents_offset === -Math.round(half_step_cents)) {
    cents_offset = Math.round(half_step_cents);
    raw_step -= 1;
  }

  const step_mod_n = ((raw_step % n_edo) + n_edo) % n_edo;

  let cents_str = "";
  if (cents_offset > 0) {
    cents_str = ` +${cents_offset}¢`;
  } else if (cents_offset < 0) {
    cents_str = ` ${cents_offset}¢`;
  }

  const is_12n = (n_edo % 12 === 0);
  const use_note_format = chk_show_note_with_step.checked && is_12n;

  let formatted_text = "";

  if (use_note_format) {
    const steps_per_semitone = n_edo / 12;
    const { step: tonic_step_12 } = parse_note_info(input_base_tonic.value.trim());

    const semitones_from_tonic = Math.floor(step_mod_n / steps_per_semitone);
    const sub_step = step_mod_n % steps_per_semitone;

    const target_12step_index = (tonic_step_12 + semitones_from_tonic) % 12;

    const target_table = NOTE_TABLES[langIndex] || note_to_12step_en;
    const note_name = target_table[target_12step_index][0];

    if (sub_step !== 0) {
      formatted_text = `[${note_name} + <sup>${n_edo}</sup>${sub_step}'${cents_str}]`;
    } else {
      formatted_text = `[${note_name}${cents_str}]`;
    }

  } else {
    formatted_text = `[<sup>${n_edo}</sup>${step_mod_n}'${cents_str}]`;
  }

  return {
    step: step_mod_n,
    cents_str: cents_str,
    formatted_text: formatted_text
  };
}


// ==========================================
// 6. 文字列解析・記号生成ユーティリティ関数
// ==========================================

/**
 * 音名文字列から12stepのインデックス番号と該当言語を判定・抽出します。
 * 選択されている表記モードの言語を優先して検索します。
 * @param {string} note_str - 解析対象の音名文字列
 * @returns {Object} 12step位置(step)と言語ID(langIndex)
 */
function parse_note_info(note_str) {
  const preferredLang = get_selected_lang_index();
  
  // 1. まず現在選択されている優先言語テーブルから検索
  const prefTable = NOTE_TABLES[preferredLang];
  for (let step = 0; step < prefTable.length; step++) {
    if (prefTable[step].includes(note_str)) {
      return { step: step, langIndex: preferredLang };
    }
  }

  // 2. 見つからない場合は他の言語テーブルを検索
  for (let langIndex = 0; langIndex < NOTE_TABLES.length; langIndex++) {
    if (langIndex === preferredLang) continue; // 既に検索済み
    const table = NOTE_TABLES[langIndex];
    for (let step = 0; step < table.length; step++) {
      if (table[step].includes(note_str)) {
        return { step: step, langIndex: langIndex };
      }
    }
  }
  
  return { step: 0, langIndex: preferredLang };
}

/**
 * 2つの整数の最大公約数を計算します（ユークリッドの互除法）。
 * @param {number} a - 整数A
 * @param {number} b - 整数B
 * @returns {number} 最大公約数
 */
function getGCD(a, b) {
  return b === 0 ? a : getGCD(b, a % b);
}

/**
 * 各次元の選択数から約分された分数テキスト表記（例: "(×3/2)"）を生成します。
 * @param {number[]} array_count - 各次元の選択数配列
 * @returns {string} 分数表記テキスト
 */
function calc_all_mult_text(array_count) {
  let num = 1;
  let den = 1;

  for (let i = 0; i < array_count.length; i++) {
    const count = array_count[i];
    if (count > 0) {
      num *= Math.pow(dim_to_numerators[i], count);
      den *= Math.pow(dim_to_denominators[i], count);
    } else if (count < 0) {
      const absCount = Math.abs(count);
      num *= Math.pow(dim_to_denominators[i], absCount);
      den *= Math.pow(dim_to_numerators[i], absCount);
    }
  }

  const commonGCD = getGCD(num, den);
  const reducedNum = num / commonGCD;
  const reducedDen = den / commonGCD;

  return (reducedDen === 1) ? `(×${reducedNum})` : `(×${reducedNum}/${reducedDen})`;
}

/**
 * カウント数に応じた矢印画像HTMLを生成します（矢印のみ指定色で着色）
 * 矢印画像には alt="↑" / alt="↓" を付与し、スクリーンリーダーでも
 * 方向が読み上げられるようにしています。
 * @param {number} count - 方向・回数
 * @param {number} dim - 次元番号 (1〜6)
 * @returns {string} HTML文字列
 */
function gen_arrow_repeated(count, dim) {
  if (count === 0) return "";
  
  const isAscent = count > 0;
  const absCount = Math.abs(count);
  const src = isAscent ? "ascent-symbol.png" : "descent-symbol.png";
  const alt = isAscent ? "↑" : "↓";
  
  const imgTag = `<img src="${src}" alt="${alt}" class="arrow-dim-icon dim-color-${dim}" style="height: 1em; width: auto; vertical-align: middle;">`;
  
  // <sup>は付けずに画像文字列だけをリピートして返す
  return imgTag.repeat(absCount);
}


/**
 * 現在アクティブになっている次元の記号と矢印を集計します
 */
function get_current_interval_symbol() {
  let symbols = [];
  intervalCounts.forEach((count, i) => {
    if (count !== 0) {
      const dimIndex = i + 1; // 1〜6
      // 矢印（gen_arrow_repeated）全体を <sup> で囲む
      symbols.push(`${dimIndex}<sup>${gen_arrow_repeated(count, dimIndex)}</sup>`);
    }
  });
  return symbols.length > 0 ? symbols.join(" ") : "-";
}

/**
 * HTMLタグ外の数字（1〜6）のみを判定して画像タグに置換するヘルパー関数
 * ※このプロジェクトはこれ以上の拡張を行わない前提のため、
 *   次元記号専用の実験的な置換処理として許容しています。
 * @param {string} text - "1<sup>...</sup>" などのHTML文字列
 * @returns {string} 画像タグに置き換わったHTML文字列
 */
function replace_dim_symbols_with_images(text) {
  // HTMLタグ（<... >）の区切りでテキストを分割
  const parts = text.split(/(<[^>]*>)/g);

  return parts.map(part => {
    // タグ自体（<で始まる部分）は置換せずそのまま返す
    if (part.startsWith('<')) {
      return part;
    }
    // タグの外側にある単体の数字 (1〜6) のみを画像タグに置換
    return part.replace(/\b([1-6])\b/g, (match, dim) => {
      return `<img src="${dim}d-symbol.png" alt="${dim}次元" class="dim-icon" id="dim-icon-${dim}d">`;
    });
  }).join('');
}


// ==========================================
// 7. 音声再生（Web Audio API）関数
// ==========================================

let audioCtx = null;

/**
 * 周波数(Hz)を指定して、指定したタイミング(delaySeconds)から音を鳴らします。
 * @param {number} frequency - 再生する周波数(Hz)
 * @param {number} duration - 発音時間(秒)
 * @param {number} delaySeconds - 発音を開始するまでの遅延時間(秒)
 */
function playTone(frequency, duration = 3.0, delaySeconds = 0) {
  if (!frequency || isNaN(frequency)) return;

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  const startTime = audioCtx.currentTime + delaySeconds;
  const releaseTime = 0.3;
  const sustainTime = duration - releaseTime;
  const stopTime = startTime + duration;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.05, startTime + 0.05); 
  gain.gain.setValueAtTime(0.05, startTime + sustainTime);
  gain.gain.linearRampToValueAtTime(0.0001, stopTime);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(startTime);
  osc.stop(stopTime);
}

/**
 * 「基音」と「目標周波数」を少しずらして再生します。
 */
function playCurrentResultAudio() {
  update_input();

  // 1. 基音周波数の算出
  const { step: base_step } = parse_note_info(base_note_str);
  const total_12step_offset = base_step + (base_note_offset * (12 / n_edo));
  const actual_base_pitch = base_pitch * Math.pow(2, total_12step_offset / 12);

  // 2. 目標周波数の算出
  const mult_val = calc_all_mult_value(intervalCounts);
  const target_pitch = actual_base_pitch * mult_val;

  // 3. 発音処理（基音を2.0秒、0.25秒遅れて目標音を1.75秒）
  playTone(actual_base_pitch, 2.0, 0);
  playTone(target_pitch, 1.75, 0.25);
}


// ==========================================
// 8. 初期化処理
// ==========================================

// ページ読み込み時に、前回保存された設定を復元してから初回描画を行う
load_settings_from_storage();
update_all();
});