export function TestCardInfo() {
    return (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-sm font-semibold text-blue-800 mb-2">
                💳 テスト用カード情報（デモサイト用）
            </p>
            <div className="space-y-1 text-sm text-blue-700">
                <div>
                    <strong>成功:</strong>{' '}
                    <code className="bg-blue-100 px-2 py-1 rounded text-xs">4242 4242 4242 4242</code>
                </div>
                <div>
                    <strong>3Dセキュア認証:</strong>{' '}
                    <code className="bg-blue-100 px-2 py-1 rounded text-xs">4000 0025 0000 3155</code>
                </div>
                <div>
                    <strong>失敗:</strong>{' '}
                    <code className="bg-blue-100 px-2 py-1 rounded text-xs">4000 0000 0000 0002</code>
                </div>
                <div className="mt-2 text-xs text-blue-600">
                    有効期限: 任意の未来の日付（例: 12/34） | CVC: 任意の3桁（例: 123）
                </div>
            </div>
        </div>
    );
}

