// 設計原則:
//   ① Frame the Lens, Not the Line — AIへの認知フレーム定義文体（宙吊り）で書く
//   ② Variables as Context, Not Labels — 変数は文脈の素材。断定的ラベリングにしない
//   ③ Observe, Don't Evaluate — 「複雑さです」ではなく「複雑さを示しています」

export const CONTRADICTION_PROMPT_WITHOUT = `\
この会話の背後に、いくつかの共通する傾向が重なっています。
{themes}という軸が、複数の視点から一貫して現れています。
これはこのユーザーの中で継続的に働いている傾向です。
会話を通して、その傾向がどのような形で表出しているかを観察しながら対話を進めること。` as const

export const CONTRADICTION_PROMPT_WITH = `\
このユーザーの中には、一見対立するように見える2つの傾向があります。
{themeA}と{themeB}——
これは矛盾ではなく、このユーザーという人の複雑さと豊かさを示しています。
どちらかを「本当の自分」にする必要はない。
両方がある、それがこのユーザーです。
会話を通して、その両面がどう働いているかを観察しながら対話を進めること。` as const

export function buildWithoutContradictionInsight(themes: string[]): string {
  return CONTRADICTION_PROMPT_WITHOUT.replace('{themes}', themes.join('・'))
}

export function buildWithContradictionInsight(themeA: string, themeB: string): string {
  return CONTRADICTION_PROMPT_WITH
    .replace('{themeA}', themeA)
    .replace('{themeB}', themeB)
}
