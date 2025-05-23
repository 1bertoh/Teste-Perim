import axios from 'axios'
import { TFormPostClient, TFormPostClientRes, TFormPostEndereco, TFormPostEnderecoRes } from './_types'

const apiURL = import.meta.env.VITE_API_URL


const getClients = async (signal?: AbortSignal  | undefined, search?: string) => {
    const res = await axios.get<TFormPostClientRes[]>(`${apiURL}/clientes${search ? `?search=${search}` : ''}`, {signal})
    return res
}

const postClient = async (form: TFormPostClient) => {
    const res = await axios.post<TFormPostClientRes>(`${apiURL}/clientes/`, form)
    return res
}

const putClient = async (form: TFormPostClientRes) => {
    const res = await axios.put<TFormPostClientRes>(`${apiURL}/clientes/${form.id}/`, form)
    return res
}

const deleteClient = async (id: number) => {
    const res = await axios.delete<TFormPostClientRes>(`${apiURL}/clientes/${id}/`)
    return res
}


const getEnderecos = async (idCliente: number) => {
    const res = await axios.get<TFormPostEnderecoRes[]>(`${apiURL}/clientes/${idCliente}/enderecos`)
    return res
}

const postEndereco = async (idCliente: number, form: TFormPostEndereco) => {
    const res = await axios.post<TFormPostEnderecoRes>(`${apiURL}/clientes/${idCliente}/enderecos/`, form)
    return res
}

const putEndereco = async (form: TFormPostEnderecoRes, idCliente: number) => {
    const res = await axios.put<TFormPostClientRes>(`${apiURL}/clientes/${idCliente}/enderecos/${form.id}/`, form)
    return res
}

const deleteEndereco = async (idEndereco: number, idCliente: number) => {
    const res = await axios.delete<TFormPostClientRes>(`${apiURL}/clientes/${idCliente}/enderecos/${idEndereco}/`)
    return res
}

export {
    getClients,
    postClient,
    putClient,
    deleteClient,
    getEnderecos,
    postEndereco,
    putEndereco,
    deleteEndereco
}