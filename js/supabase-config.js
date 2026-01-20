// ============================================
// BARBERX - Supabase Configuration
// Credenciais carregadas do servidor via /api/config
// ============================================

// Supabase client - inicializado dinamicamente
let supabase = null;
let supabaseReady = false;

// Inicializar Supabase carregando credenciais do servidor
async function initSupabase() {
    if (supabase && supabaseReady) return supabase;

    try {
        // Buscar credenciais do servidor (que le do .env)
        const response = await fetch('/api/config');
        const config = await response.json();

        if (!config.supabaseUrl || !config.supabaseAnonKey) {
            console.error('Credenciais do Supabase nao configuradas no servidor');
            return null;
        }

        if (window.supabase) {
            supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
            supabaseReady = true;
            console.log('Supabase inicializado com sucesso');
        }
    } catch (error) {
        console.error('Erro ao inicializar Supabase:', error);
    }

    return supabase;
}

// Garantir que Supabase esta inicializado antes de usar
async function ensureSupabase() {
    if (!supabase || !supabaseReady) {
        await initSupabase();
    }
    if (!supabase) {
        throw new Error('Supabase nao inicializado');
    }
    return supabase;
}

// ============================================
// BARBEARIAS
// ============================================

async function getBarbeariaBySlug(slug) {
    const db = await ensureSupabase();
    const { data, error } = await db
        .from('barbearias')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Erro ao buscar barbearia:', error);
        return null;
    }
    return data;
}

async function getAllBarbearias() {
    const db = await ensureSupabase();
    const { data, error } = await db
        .from('barbearias')
        .select('*')
        .eq('plano_ativo', true)
        .order('nome');

    if (error) {
        console.error('Erro ao buscar barbearias:', error);
        return [];
    }
    return data;
}

// ============================================
// SERVICOS
// ============================================

async function getServicosByBarbearia(barbeariaId) {
    const db = await ensureSupabase();
    const { data, error } = await db
        .from('servicos')
        .select('*')
        .eq('barbearia_id', barbeariaId)
        .eq('ativo', true)
        .order('ordem');

    if (error) {
        console.error('Erro ao buscar servicos:', error);
        return [];
    }
    return data;
}

// ============================================
// PROFISSIONAIS
// ============================================

async function getProfissionaisByBarbearia(barbeariaId) {
    const db = await ensureSupabase();
    const { data, error } = await db
        .from('profissionais')
        .select('*')
        .eq('barbearia_id', barbeariaId)
        .eq('ativo', true)
        .order('nome');

    if (error) {
        console.error('Erro ao buscar profissionais:', error);
        return [];
    }
    return data;
}

async function getProfissionalServicos(profissionalId) {
    const db = await ensureSupabase();
    const { data, error } = await db
        .from('profissional_servicos')
        .select(`
            servico_id,
            preco_especial,
            servicos (*)
        `)
        .eq('profissional_id', profissionalId);

    if (error) {
        console.error('Erro ao buscar servicos do profissional:', error);
        return [];
    }
    return data;
}

// ============================================
// AGENDAMENTOS
// ============================================

async function getAgendamentosByData(barbeariaId, data) {
    const db = await ensureSupabase();
    const { data: agendamentos, error } = await db
        .from('agendamentos')
        .select(`
            *,
            profissionais (id, nome, apelido, cor_agenda),
            servicos (id, nome, preco, duracao_minutos)
        `)
        .eq('barbearia_id', barbeariaId)
        .eq('data', data)
        .not('status', 'in', '("cancelado","faltou")');

    if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return [];
    }
    return agendamentos;
}

async function getAgendamentosByProfissional(profissionalId, dataInicio, dataFim) {
    const db = await ensureSupabase();
    const { data, error } = await db
        .from('agendamentos')
        .select('*')
        .eq('profissional_id', profissionalId)
        .gte('data', dataInicio)
        .lte('data', dataFim)
        .not('status', 'in', '("cancelado","faltou")');

    if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return [];
    }
    return data;
}

async function createAgendamento(agendamento) {
    const db = await ensureSupabase();
    const { data, error } = await db
        .from('agendamentos')
        .insert([agendamento])
        .select()
        .single();

    if (error) {
        console.error('Erro ao criar agendamento:', error);
        throw error;
    }
    return data;
}

async function updateAgendamentoStatus(agendamentoId, status) {
    const db = await ensureSupabase();
    const updateData = { status };

    if (status === 'cancelado') {
        updateData.cancelado_em = new Date().toISOString();
    }

    const { data, error } = await db
        .from('agendamentos')
        .update(updateData)
        .eq('id', agendamentoId)
        .select()
        .single();

    if (error) {
        console.error('Erro ao atualizar agendamento:', error);
        throw error;
    }
    return data;
}

// ============================================
// HORARIOS DISPONIVEIS
// ============================================

async function getHorariosDisponiveis(barbeariaId, profissionalId, data, duracaoMinutos) {
    const db = await ensureSupabase();

    // Buscar configuracoes da barbearia
    const { data: barbearia } = await db
        .from('barbearias')
        .select('horario_abertura, horario_fechamento, intervalo_agendamento')
        .eq('id', barbeariaId)
        .single();

    if (!barbearia) return [];

    // Buscar agendamentos existentes
    const agendamentosExistentes = await getAgendamentosByData(barbeariaId, data);
    const agendamentosProfissional = profissionalId
        ? agendamentosExistentes.filter(a => a.profissional_id === profissionalId)
        : agendamentosExistentes;

    // Buscar horarios bloqueados
    const { data: bloqueios } = await db
        .from('horarios_bloqueados')
        .select('*')
        .eq('barbearia_id', barbeariaId)
        .lte('data_inicio', data)
        .gte('data_fim', data);

    // Gerar slots disponiveis
    const slots = [];
    const [horaAbertura, minAbertura] = barbearia.horario_abertura.split(':').map(Number);
    const [horaFechamento, minFechamento] = barbearia.horario_fechamento.split(':').map(Number);
    const intervalo = barbearia.intervalo_agendamento || 30;

    let currentMinutes = horaAbertura * 60 + minAbertura;
    const endMinutes = horaFechamento * 60 + minFechamento;

    while (currentMinutes + duracaoMinutos <= endMinutes) {
        const hora = Math.floor(currentMinutes / 60);
        const minuto = currentMinutes % 60;
        const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;

        const fimMinutes = currentMinutes + duracaoMinutos;
        const horaFim = Math.floor(fimMinutes / 60);
        const minutoFim = fimMinutes % 60;
        const horaFimStr = `${horaFim.toString().padStart(2, '0')}:${minutoFim.toString().padStart(2, '0')}`;

        // Verificar conflitos
        const temConflito = agendamentosProfissional.some(a => {
            const [aHoraInicio, aMinInicio] = a.hora_inicio.split(':').map(Number);
            const [aHoraFim, aMinFim] = a.hora_fim.split(':').map(Number);
            const aInicio = aHoraInicio * 60 + aMinInicio;
            const aFim = aHoraFim * 60 + aMinFim;

            return (currentMinutes >= aInicio && currentMinutes < aFim) ||
                   (fimMinutes > aInicio && fimMinutes <= aFim) ||
                   (currentMinutes <= aInicio && fimMinutes >= aFim);
        });

        // Verificar bloqueios
        const estaBloqueado = bloqueios?.some(b => {
            if (b.profissional_id && b.profissional_id !== profissionalId) return false;
            if (!b.hora_inicio) return true; // Dia inteiro bloqueado

            const [bHoraInicio, bMinInicio] = b.hora_inicio.split(':').map(Number);
            const [bHoraFim, bMinFim] = b.hora_fim.split(':').map(Number);
            const bInicio = bHoraInicio * 60 + bMinInicio;
            const bFim = bHoraFim * 60 + bMinFim;

            return (currentMinutes >= bInicio && currentMinutes < bFim);
        });

        if (!temConflito && !estaBloqueado) {
            slots.push({
                hora_inicio: horaStr,
                hora_fim: horaFimStr,
                disponivel: true
            });
        }

        currentMinutes += intervalo;
    }

    return slots;
}

// ============================================
// CLIENTES
// ============================================

async function getClientesByBarbearia(barbeariaId) {
    const db = await ensureSupabase();
    const { data, error } = await db
        .from('usuarios')
        .select('*')
        .eq('tipo', 'cliente')
        .order('nome');

    if (error) {
        console.error('Erro ao buscar clientes:', error);
        return [];
    }

    return data;
}

async function createOrUpdateCliente(cliente) {
    const db = await ensureSupabase();

    // Verificar se cliente existe pelo email
    const { data: existing } = await db
        .from('usuarios')
        .select('id')
        .eq('email', cliente.email)
        .single();

    if (existing) {
        // Atualizar
        const { data, error } = await db
            .from('usuarios')
            .update({
                nome: cliente.nome,
                telefone: cliente.telefone
            })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } else {
        // Criar novo
        const { data, error } = await db
            .from('usuarios')
            .insert([{
                nome: cliente.nome,
                email: cliente.email,
                telefone: cliente.telefone,
                tipo: 'cliente'
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

// ============================================
// ESTATISTICAS (Dashboard)
// ============================================

async function getDashboardStats(barbeariaId) {
    const db = await ensureSupabase();
    const hoje = new Date().toISOString().split('T')[0];
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Agendamentos hoje
    const { count: agendamentosHoje } = await db
        .from('agendamentos')
        .select('*', { count: 'exact', head: true })
        .eq('barbearia_id', barbeariaId)
        .eq('data', hoje)
        .not('status', 'in', '("cancelado","faltou")');

    // Faturamento hoje
    const { data: fatHoje } = await db
        .from('agendamentos')
        .select('preco')
        .eq('barbearia_id', barbeariaId)
        .eq('data', hoje)
        .in('status', ['confirmado', 'concluido']);

    const faturamentoHoje = fatHoje?.reduce((sum, a) => sum + parseFloat(a.preco), 0) || 0;

    // Faturamento do mes
    const { data: fatMes } = await db
        .from('agendamentos')
        .select('preco')
        .eq('barbearia_id', barbeariaId)
        .gte('data', inicioMes)
        .in('status', ['confirmado', 'concluido']);

    const faturamentoMes = fatMes?.reduce((sum, a) => sum + parseFloat(a.preco), 0) || 0;

    // Total de atendimentos no mes
    const { count: atendimentosMes } = await db
        .from('agendamentos')
        .select('*', { count: 'exact', head: true })
        .eq('barbearia_id', barbeariaId)
        .gte('data', inicioMes)
        .in('status', ['confirmado', 'concluido']);

    return {
        agendamentosHoje: agendamentosHoje || 0,
        faturamentoHoje,
        faturamentoMes,
        atendimentosMes: atendimentosMes || 0,
        ticketMedio: atendimentosMes > 0 ? faturamentoMes / atendimentosMes : 0
    };
}

// ============================================
// AUTH (Google/Facebook)
// ============================================

async function signInWithGoogle() {
    const db = await ensureSupabase();
    const { data, error } = await db.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/admin'
        }
    });

    if (error) {
        console.error('Erro no login:', error);
        throw error;
    }
    return data;
}

async function signInWithFacebook() {
    const db = await ensureSupabase();
    const { data, error } = await db.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
            redirectTo: window.location.origin + '/admin'
        }
    });

    if (error) {
        console.error('Erro no login:', error);
        throw error;
    }
    return data;
}

async function signOut() {
    const db = await ensureSupabase();
    const { error } = await db.auth.signOut();
    if (error) {
        console.error('Erro no logout:', error);
        throw error;
    }
}

async function getCurrentUser() {
    const db = await ensureSupabase();
    const { data: { user } } = await db.auth.getUser();
    return user;
}

async function onAuthStateChange(callback) {
    const db = await ensureSupabase();
    db.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

// ============================================
// EXPORTS (for modules) or global
// ============================================

window.BarberXDB = {
    initSupabase,
    ensureSupabase,
    // Barbearias
    getBarbeariaBySlug,
    getAllBarbearias,
    // Servicos
    getServicosByBarbearia,
    // Profissionais
    getProfissionaisByBarbearia,
    getProfissionalServicos,
    // Agendamentos
    getAgendamentosByData,
    getAgendamentosByProfissional,
    createAgendamento,
    updateAgendamentoStatus,
    getHorariosDisponiveis,
    // Clientes
    getClientesByBarbearia,
    createOrUpdateCliente,
    // Stats
    getDashboardStats,
    // Auth
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    getCurrentUser,
    onAuthStateChange
};

// Auto-inicializar quando a pagina carregar
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
});
