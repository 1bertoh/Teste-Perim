export interface TFormPostClient {
    nome: string;
    cpf: string;
    telefone: string;
}
export interface TFormPostClientRes extends TFormPostClient {
    id: number;
    enderecos: TFormPostEnderecoRes[];
}

export interface TFormPostEndereco {
        cep: string;
        logradouro: string;
        numero: string;
        complemento: string;
        bairro: string;
        cidade: string;
        estado: string;
        principal: boolean
}
export interface TFormPostEnderecoRes extends TFormPostEndereco {
        id: number;
        cliente: number;
}