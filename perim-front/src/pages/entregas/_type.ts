import { TFormPostEnderecoRes } from "../clientes/_types";
import { EntregadorRes } from "../entregadores/_types";

export interface Entrega {
    cliente: number;
    endereco: number;
    entregador: number | EntregadorRes;
    numero_caixas: number;
    bebidas: boolean;
    frios_congelados: boolean;
    vassoura_rodo: boolean;
    outros: boolean;
    nome_embalador: string;
    numero_nfce: string;
    serie_nfce: string;
    data_compra: string;
    data_hora_entrega: string;
}

export interface EntregaRes extends Entrega {
    id: number;
    cliente_nome: string;
    endereco_detalhes: TFormPostEnderecoRes;
    entregador: EntregadorRes;
    entregador_id: number;
    status: 'pendente'|'em_transito'|'entregue';
    created_at: string;
    updated_at: string;
}