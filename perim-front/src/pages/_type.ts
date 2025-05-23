
export interface Relatorio {
    total_clientes: number;
    total_entregas: number;
    total_enderecos: number;
    total_entregadores: number;
    entregas_por_mes: { mes: string; total: number }[];
    top_clientes_com_mais_entregas: { id: number; nome: string; total_entregas: number }[];
    entregador_do_dia: { id: number | null; nome: string; total_entregas_hoje: number };
    distribuicao_status_entregas: { status: string; total: number }[];
}