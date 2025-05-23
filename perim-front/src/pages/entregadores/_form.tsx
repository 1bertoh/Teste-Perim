import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { User } from "lucide-react";
import { useState } from "react";

type props = {
    onAdd: (nome: string) => void;
    onCancel: () => void
}


const EntregadorForm = (props: props) => {
    const {onAdd, onCancel} = props
    const [nome, setNome] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nome.trim()) {
            onAdd(nome.trim());
            setNome('');
        }
    };

    return (
        <Card className="mb-6">
            <CardBody className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Adicionar Novo Entregador
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            type="text"
                            label="Nome do Entregador"
                            placeholder="Digite o nome completo do entregador"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            variant="bordered"
                            isRequired
                            className="w-full"
                        />
                    </div>
                    
                    <div className="flex gap-3 justify-end">
                        <Button
                            type="button"
                            variant="light"
                            onPress={onCancel}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isDisabled={!nome.trim()}
                            className='bg-[#45e519] font-bold'
                        >
                            Adicionar Entregador
                        </Button>
                    </div>
                </form>
            </CardBody>
        </Card>
    );
};

export default EntregadorForm