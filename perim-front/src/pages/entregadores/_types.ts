export interface Entrega {
    id: string;
    cliente: string;
    endereco: string;
    numeroCaixas: number;
    volumesExtras: {
        bebidas: boolean;
        friosCongelados: boolean;
        vassouraRodo: boolean;
        outros: boolean;
    };
    nomeEmbalador: string;
    numeroNFCe: string;
    serieNFCe: string;
    dataCompra: string;
    dataHoraEntrega: string;
    status: 'pendente' | 'em_transito' | 'entregue';
    dataCriacao: string;
    nomeEntregador?: string;
}

export interface Entregador {
    id: number;
    nome: string;
}
export interface EntregadorRes extends Entregador {
    created_at: string;
    updated_at: string;

}

export const STATUS_CONFIG = {
    pendente: { label: 'Pendente', color: 'warning' as const },
    em_transito: { label: 'Em Trânsito', color: 'primary' as const },
    entregue: { label: 'Entregue', color: 'success' as const }
};