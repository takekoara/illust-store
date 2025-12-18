export function TestCardInfo() {
    return (
        <>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                <p className="text-sm text-blue-800 mb-3">
                    <strong>テスト用カード情報:</strong>
                </p>
                <div className="space-y-2 text-sm text-blue-700">
                    <div>
                        <strong>成功:</strong>{' '}
                        <code className="bg-blue-100 px-2 py-1 rounded">4242 4242 4242 4242</code>
                    </div>
                    <div>
                        <strong>3Dセキュア認証が必要:</strong>{' '}
                        <code className="bg-blue-100 px-2 py-1 rounded">4000 0025 0000 3155</code>
                    </div>
                    <div>
                        <strong>失敗:</strong>{' '}
                        <code className="bg-blue-100 px-2 py-1 rounded">4000 0000 0000 0002</code>
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                        有効期限: 任意の未来の日付（例: 12/34）
                        <br />
                        CVC: 任意の3桁（例: 123）
                    </div>
                </div>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                <p className="text-sm text-yellow-800">
                    <strong>重要:</strong> テスト用のカード情報を使用してください。
                    実際のクレジットカード情報は入力しないでください。
                </p>
            </div>
        </>
    );
}

