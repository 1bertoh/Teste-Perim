import { useState } from 'react';
import { Input } from "@heroui/input";
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { postClient, postEndereco } from './_requests';
import { TFormPostEndereco } from './_types';
import { addToast } from '@heroui/toast';

interface Endereco {
    id: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
}

const RegisterClients = () => {
    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        telefone: ''
    });

    const [enderecos, setEnderecos] = useState<Endereco[]>([
        {
            id: '1',
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: ''
        }
    ]);

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEnderecoChange = (id: string, campo: string, valor: string) => {
        setEnderecos(prev =>
            prev.map(endereco =>
                endereco.id === id
                    ? { ...endereco, [campo]: valor }
                    : endereco
            )
        );
    };

    const adicionarEndereco = () => {
        const novoId = Date.now().toString();
        setEnderecos(prev => [...prev, {
            id: novoId,
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: ''
        }]);
    };

    const removerEndereco = (id: string) => {
        if (enderecos.length > 1) {
            setEnderecos(prev => prev.filter(endereco => endereco.id !== id));
        }
    };

    const formatarCPF = (valor: string) => {
        const numeros = valor.replace(/\D/g, '');
        return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const formatarTelefone = (valor: string) => {
        const numeros = valor.replace(/\D/g, '');
        if (numeros.length <= 10) {
            return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };

    const formatarCEP = (valor: string) => {
        const numeros = valor.replace(/\D/g, '');
        return numeros.replace(/(\d{5})(\d{3})/, '$1-$2');
    };

    const handleCPFChange = (e: any) => {
        const valorFormatado = formatarCPF(e.target.value);
        if (valorFormatado.length <= 14) {
            setFormData(prev => ({ ...prev, cpf: valorFormatado }));
        }
    };

    const handleTelefoneChange = (e: any) => {
        const valorFormatado = formatarTelefone(e.target.value);
        if (valorFormatado.length <= 15) {
            setFormData(prev => ({ ...prev, telefone: valorFormatado }));
        }
    };

    const handleCEPChange = (id: string, valor: string) => {
        const valorFormatado = formatarCEP(valor);
        if (valorFormatado.length <= 9) {
            handleEnderecoChange(id, 'cep', valorFormatado);
        }
    };

    const handleSubmit = async () => {
        try{
            const res1 = await postClient(formData)
            const clientId = res1.data.id
    
            const promessasDeEnderecos = enderecos.map(async (endereco, index) => {
                try {
                    const responseEndereco = await postEndereco(clientId, endereco as unknown as TFormPostEndereco);
                    return responseEndereco.data;
                } catch (error) {
                    console.error(`Erro ao criar endereço ${index + 1} para o cliente ID: ${clientId}`, error);
                    throw new Error(`Falha ao enviar o endereço ${index + 1}: ${(error as Error).message}`);
                }
            });
            const enderecosCriados = await Promise.all(promessasDeEnderecos);
            addToast({
                title: "Cliente criado com sucesso!",
                color: 'success'
            });
            console.log(enderecosCriados)
        }catch(e) {
            addToast({
                title: "Houve um erro",
                color: 'danger'
            });
        }
    };

    const handleCancel = () => {
        setFormData({
            nome: '',
            cpf: '',
            telefone: ''
        });
        setEnderecos([{
            id: '1',
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: ''
        }]);
    };

    return (
            <div className="flex w-full h-full grow flex-col">
                <main className="  flex flex-1 justify-center">
                    <div className="flex flex-col w-full py-5">

                        <div className="bg-white p-8 rounded-xl shadow-lg">
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Dados Pessoais</h2>
                                <div className="space-y-6">
                                    <Input
                                        name="nome"
                                        value={formData.nome}
                                        onChange={handleInputChange}
                                        label="Nome completo"
                                        placeholder="Digite o nome completo do cliente"
                                        variant="bordered"
                                        className="w-full"
                                        isRequired
                                    />

                                    <div className="flex sm:flex-row flex-col sm:gap-4 gap-6">
                                        <Input
                                            value={formData.cpf}
                                            onChange={handleCPFChange}
                                            label="CPF"
                                            placeholder="000.000.000-00"
                                            variant="bordered"
                                            className="w-full sm:w-1/2"
                                            isRequired
                                        />
                                        <Input
                                            value={formData.telefone}
                                            onChange={handleTelefoneChange}
                                            label="Telefone"
                                            placeholder="(00) 00000-0000"
                                            variant="bordered"
                                            className="w-full sm:w-1/2"
                                            isRequired
                                        />
                                    </div>
                                </div>
                            </div>

                            <Divider />

                            <div className="mt-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Endereços</h2>
                                    <Button
                                        onPress={adicionarEndereco}
                                        color="success"
                                        variant="flat"
                                        size="sm"
                                        className='font-bold'
                                    >
                                        + Adicionar Endereço
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {enderecos.map((endereco, index) => (
                                        <Card key={endereco.id} className="w-full">
                                            <CardBody className="p-6">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        Endereço {index + 1}
                                                    </h3>
                                                    {enderecos.length > 1 && (
                                                        <Button
                                                            onPress={() => removerEndereco(endereco.id)}
                                                            color="danger"
                                                            variant="light"
                                                            size="sm"
                                                        >
                                                            Remover
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex sm:flex-row flex-col sm:gap-4 gap-4">
                                                        <Input
                                                            value={endereco.cep}
                                                            onChange={(e) => handleCEPChange(endereco.id, e.target.value)}
                                                            label="CEP"
                                                            placeholder="00000-000"
                                                            variant="bordered"
                                                            className="w-full sm:w-1/3"
                                                            isRequired
                                                        />
                                                        <Input
                                                            value={endereco.logradouro}
                                                            onChange={(e) => handleEnderecoChange(endereco.id, 'logradouro', e.target.value)}
                                                            label="Logradouro"
                                                            placeholder="Nome da rua, avenida, etc."
                                                            variant="bordered"
                                                            className="w-full sm:w-2/3"
                                                            isRequired
                                                        />
                                                    </div>

                                                    <div className="flex sm:flex-row flex-col sm:gap-4 gap-4">
                                                        <Input
                                                            value={endereco.numero}
                                                            onChange={(e) => handleEnderecoChange(endereco.id, 'numero', e.target.value)}
                                                            label="Número"
                                                            placeholder="123"
                                                            variant="bordered"
                                                            className="w-full sm:w-1/3"
                                                            isRequired
                                                        />
                                                        <Input
                                                            value={endereco.complemento}
                                                            onChange={(e) => handleEnderecoChange(endereco.id, 'complemento', e.target.value)}
                                                            label="Complemento"
                                                            placeholder="Apto, casa, bloco (opcional)"
                                                            variant="bordered"
                                                            className="w-full sm:w-2/3"
                                                        />
                                                    </div>

                                                    <div className="flex sm:flex-row flex-col sm:gap-4 gap-4">
                                                        <Input
                                                            value={endereco.bairro}
                                                            onChange={(e) => handleEnderecoChange(endereco.id, 'bairro', e.target.value)}
                                                            label="Bairro"
                                                            placeholder="Nome do bairro"
                                                            variant="bordered"
                                                            className="w-full sm:w-1/3"
                                                            isRequired
                                                        />
                                                        <Input
                                                            value={endereco.cidade}
                                                            onChange={(e) => handleEnderecoChange(endereco.id, 'cidade', e.target.value)}
                                                            label="Cidade"
                                                            placeholder="Nome da cidade"
                                                            variant="bordered"
                                                            className="w-full sm:w-1/3"
                                                            isRequired
                                                        />
                                                        <Input
                                                            value={endereco.estado}
                                                            onChange={(e) => handleEnderecoChange(endereco.id, 'estado', e.target.value)}
                                                            label="Estado"
                                                            placeholder="UF"
                                                            variant="bordered"
                                                            className="w-full sm:w-1/3"
                                                            maxLength={2}
                                                            isRequired
                                                        />
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            <div className="flex pt-8 justify-end items-center gap-4">
                                <Button
                                    onPress={handleCancel}
                                    color='danger'
                                    variant='light'
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onPress={handleSubmit}
                                    className='bg-[#45e519]'
                                >
                                    Salvar
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
    );
};

export default RegisterClients;