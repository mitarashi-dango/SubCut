export interface CarrierOptionGuide {
  carrierName: string;
  badge: string;
  portalName: string;
  cancelUrl: string;
  howToCancel: string;
}

export const CARRIER_CANCEL_GUIDES: CarrierOptionGuide[] = [
  {
    carrierName: 'NTTドコモ / ahamo',
    badge: 'docomo',
    portalName: 'My docomo (爆アゲセレクション・オプション解約)',
    cancelUrl: 'https://www.docomo.ne.jp/mydocomo/',
    howToCancel: 'My docomo ＞「契約内容・手続き」＞「オプション・コンテンツ」＞ 解約したいサービス（Netflix, Lemino, YouTube等）を選択して「解約」。※Netflix直接解約では止まらないため注意！'
  },
  {
    carrierName: 'au / UQ mobile',
    badge: 'au',
    portalName: 'My au (使い放題MAXセット・エンタメ解約)',
    cancelUrl: 'https://www.au.com/my-au/',
    howToCancel: 'My au ＞「ご契約内容の確認・変更」＞「エンタメ・オプション」＞ 解約したいサービスを選択。※Netflixパックプランの場合は「通常プラン」への変更手続きが必要です。'
  },
  {
    carrierName: 'SoftBank / Y!mobile',
    badge: 'SoftBank',
    portalName: 'My SoftBank (まとめて支払い・パック解約)',
    cancelUrl: 'https://www.softbank.jp/mysoftbank/',
    howToCancel: 'My SoftBank ＞「料金・支払い管理」＞「まとめて支払い ご利用履歴」＞「登録中サービス一覧」＞「解除」をクリック。'
  },
  {
    carrierName: '楽天モバイル',
    badge: 'Rakuten',
    portalName: 'my 楽天モバイル (オプション解約)',
    cancelUrl: 'https://my.mobile.rakuten.co.jp/',
    howToCancel: 'my 楽天モバイル ＞「契約プラン」＞「オプションサービスの追加・解約」＞ 解除したいオプションを選択。'
  },
  {
    carrierName: '光回線 / プロバイダ (NURO, ドコモ光, BIGLOBE等)',
    badge: '光回線',
    portalName: '各プロバイダ会員マイページ',
    cancelUrl: 'https://www.google.com/search?q=%E3%83%97%E3%83%AD%E3%83%90%E3%82%A4%E3%83%80+%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3+%E8%A7%A3%E7%B4%84+%E3%83%9E%E3%82%A4%E3%83%9A%E3%83%BC%E3%82%B8',
    howToCancel: '光回線の開通時に付けられた「セキュリティソフト」「雑誌読み放題」「安心サポート」などは、回線会社のマイページ（契約内容変更）から個別に解約が必要です。'
  }
];
