const COLUMNS = [
    { label: '商品', align: 'left' },
    { label: '価格', align: 'left' },
    { label: '閲覧数', align: 'left' },
    { label: '販売数', align: 'left' },
    { label: 'ステータス', align: 'left' },
    { label: '並び順', align: 'left' },
    { label: '操作', align: 'right' },
] as const;

export function ProductTableHeader() {
    return (
        <thead className="bg-gray-50">
            <tr>
                {COLUMNS.map((column) => (
                    <th
                        key={column.label}
                        className={`px-6 py-3 text-${column.align} text-xs font-medium uppercase tracking-wider text-gray-500`}
                    >
                        {column.label}
                    </th>
                ))}
            </tr>
        </thead>
    );
}

