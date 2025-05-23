import axios from 'axios'
import { Relatorio } from './_type'

const apiURL = import.meta.env.VITE_API_URL


const getRelatorio = async () => {
    const res = await axios.get<Relatorio>(`${apiURL}/estatisticas/`)
    return res
}

export {getRelatorio}