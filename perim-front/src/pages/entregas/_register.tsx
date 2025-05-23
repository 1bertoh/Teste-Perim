import { useState, useEffect } from 'react';
import { Select, SelectItem } from "@heroui/select";
import { DatePicker } from "@heroui/date-picker";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { useAsyncList } from "@react-stately/data";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button } from '@heroui/button';
import { getEntregadores } from '../entregadores/_requests';
import { EntregadorRes as Entregador } from '../entregadores/_types';
import { TFormPostClientRes, TFormPostEnderecoRes } from '../clientes/_types';
import { getClients } from '../clientes/_requests';
import { addToast } from '@heroui/toast';
import { postEntrega } from './_requests';
import { Entrega } from './_type';

const resetEntrega = {
    cliente: 0,
    endereco: 0,
    numero_caixas: 0,
    entregador: 0,
    bebidas: false,
    frios_congelados: false,
    vassoura_rodo: false,
    outros: false,
    data_compra: '',
    data_hora_entrega: '',
    nome_embalador: 'Teste',
    numero_nfce: '',
    serie_nfce: ''
}

const NewDelivery = () => {
    const [formData, setFormData] = useState<Entrega>(resetEntrega);

    const [entregadores, setEntregadores] = useState<Entregador[]>([]);
    const [clientes, setClientes] = useState<TFormPostClientRes[]>([]);
    const [loadingEntregadores, setLoadingEntregadores] = useState(false);

    const [enderecosCliente, setEnderecosCliente] = useState<TFormPostEnderecoRes[]>([])

    const fetchEntregadores = async () => {
        setLoadingEntregadores(true);
        try {
            const response = await getEntregadores();
            if (!response.data) {
                throw new Error('Erro ao buscar entregadores');
            }
            const data: Entregador[] = response.data;
            setEntregadores(data);
        } catch (error) {
            console.error('Erro ao carregar entregadores:', error);
            setEntregadores([]);
        } finally {
            setLoadingEntregadores(false);
        }
    };

    useEffect(() => {
        fetchEntregadores();
    }, []);

    const handleInputChange = (e: any) => {
        console.log(e)
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClientChange = (id: string) => {
        setFormData(prev => ({
            ...prev,
            cliente: Number(id)
        }));

        const cliente = clientes.find((c) => c.id === Number(id))
        setEnderecosCliente(cliente?.enderecos || [])
        console.log(enderecosCliente)
    };

    const handleEnderecoChange = (keys: any) => {
        const selectedKey = Array.from(keys)[0] as string;
        setFormData(prev => ({
            ...prev,
            endereco: Number(selectedKey) || 0
        }));
    };

    const handleVolumeExtraChange = (campo: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            [campo]: checked
        }));
    };

    const handleEntregadorChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            entregador: Number(value)
        }));
    };

    const handleDataCompraChange = (date: any) => {
        setFormData(prev => ({
            ...prev,
            data_compra: date ? date.toString() : ''
        }));
    };

    const handleDataEntregaChange = (date: Date | undefined) => {
        if (!date) return;

        const simpleDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        setFormData(prev => ({
            ...prev,
            data_compra: simpleDate,
            data_hora_entrega: date.toISOString()
        }));
    };

    const handleSubmit = async () => {
        console.log('Dados do formulário:', formData);
        try {
            await postEntrega(formData)

            addToast({
                title: "Entrega cadastrada com sucesso!",
                color: "success"
            })
        } catch (e) {

            addToast({
                title: "Houve um erro ao cadastrar a entrega!",
                color: "danger"
            })
        }
    };

    const handleCancel = () => {
        setFormData(resetEntrega);
    };

    let list = useAsyncList<TFormPostClientRes>({
        async load({ signal, filterText }) {
            const res = await getClients(signal, filterText)
            setClientes(res.data)
            return {
                items: res.data,
            };
        },
    });

    return (
        <div className="flex h-full grow flex-col">
            <main className="flex flex-1 justify-center">
                <div className="flex flex-col w-full py-5">

                    <div className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
                        <div>
                            <div className="flex sm:flex-row flex-col sm:gap-2 gap-6">
                                <Autocomplete
                                    className="w-full sm:w-4/6"
                                    isLoading={list.isLoading}
                                    items={list.items}
                                    label="Selecione o cliente"
                                    placeholder="Digite para buscar..."
                                    variant="bordered"
                                    onInputChange={list.setFilterText}
                                    onSelectionChange={(key) => handleClientChange(key?.toString() || '0')}
                                >
                                    {(item) => (
                                        <AutocompleteItem key={item.id} className="capitalize">
                                            {item.nome}
                                        </AutocompleteItem>
                                    )}
                                </Autocomplete>
                                <div className="flex flex-col w-full sm:w-2/6">
                                    <DatePicker
                                        className="max-w-[284px] sm:ml-auto"
                                        label="Data da compra"
                                        onChange={handleDataCompraChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <Select
                                label="Endereço do cliente"
                                placeholder="Selecione o endereço"
                                variant="bordered"
                                className="w-full"
                                onSelectionChange={handleEnderecoChange}
                            >
                                {enderecosCliente.map((endereco) => (
                                    <SelectItem key={endereco.id}>
                                        {`${endereco.bairro}, ${endereco.logradouro}, ${endereco.numero}`}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div className="flex sm:flex-row flex-col sm:gap-4 gap-6">
                            <Input
                                type="number"
                                label="Número de caixas"
                                placeholder="Digite o número de caixas"
                                variant="bordered"
                                className="w-full sm:w-1/2"
                                min="1"
                                name="numeroCaixas"
                                onChange={handleInputChange}
                            />
                            <Select
                                label="Entregador"
                                placeholder={loadingEntregadores ? "Carregando entregadores..." : "Selecione o entregador"}
                                variant="bordered"
                                className="w-full sm:w-1/2"
                                isLoading={loadingEntregadores}
                                onSelectionChange={(keys) => {
                                    const selectedKey = Array.from(keys)[0] as string;
                                    handleEntregadorChange(selectedKey);
                                }}
                            >
                                {entregadores.map((entregador) => (
                                    <SelectItem key={entregador.id}>
                                        {entregador.nome}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        {/* Volumes Extras */}
                        <div>
                            <div className="flex flex-col">
                                <p className="text-gray-900 text-sm font-medium leading-normal pb-3">Volumes Extras</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <Checkbox
                                        color='success'
                                        onValueChange={(checked) => handleVolumeExtraChange('bebidas', checked)}
                                    >
                                        Bebidas
                                    </Checkbox>
                                    <Checkbox
                                        color='success'
                                        onValueChange={(checked) => handleVolumeExtraChange('friosCongelados', checked)}
                                    >
                                        Frios/Congelados
                                    </Checkbox>
                                    <Checkbox
                                        color='success'
                                        onValueChange={(checked) => handleVolumeExtraChange('vassouraRodo', checked)}
                                    >
                                        Vassouras/Rodo
                                    </Checkbox>
                                    <Checkbox
                                        color='success'
                                        onValueChange={(checked) => handleVolumeExtraChange('outros', checked)}
                                    >
                                        Outros
                                    </Checkbox>
                                </div>
                            </div>
                        </div>

                        <div className="flex sm:flex-row flex-col sm:gap-4 gap-6">
                            <Input
                                label="Número da NFCe"
                                placeholder="Digite o número da NFCe"
                                variant="bordered"
                                className="w-full sm:w-1/2"
                                name="numero_nfce"
                                value={formData.numero_nfce}
                                onChange={handleInputChange}
                            />
                            <Input
                                label="Série da NFCe"
                                placeholder="Digite a série da NFCe"
                                variant="bordered"
                                className="w-full sm:w-1/2"
                                name="serie_nfce"
                                value={formData.serie_nfce}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <div className="flex sm:flex-row flex-col sm:gap-4 gap-6">
                                <DatePicker 
                                    className="w-full"
                                    granularity="second"
                                    label="Event date"
                                    onChange={(e) => handleDataEntregaChange(e?.toDate('America/Sao_Paulo'))}
                                />

                            </div>
                        </div>

                        <div className="flex pt-4 justify-end items-center gap-4">
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

export default NewDelivery;