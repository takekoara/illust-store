const disclaimerItems = [
    '本サイトの利用により生じた損害',
    '本サイトの情報の正確性、完全性、有用性',
    '本サイトの機能の動作保証',
    '本サイトへのアクセス不能やデータの消失',
    '本サイトで使用されている画像やコンテンツの著作権侵害',
];

export function DisclaimerList() {
    return (
        <>
            <p>
                本サイトはデモンストレーション用のサイトであり、
                以下の点について一切の責任を負いかねます：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
                {disclaimerItems.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
            <p className="mt-4">本サイトの利用は、利用者の自己責任において行ってください。</p>
        </>
    );
}

