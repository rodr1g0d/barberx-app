// ============================================
// BARBERX APP - Sistema de Agendamentos
// Versao: 2.0 - Interface Single Page
// ============================================

// Dados de demonstracao
const DEMO_DATA = {
    barbearia: {
        id: 'demo-001',
        nome: 'Barbearia Teste',
        endereco: 'Av. Paulista, 1000 - Sao Paulo',
        telefone: '(11) 99999-9999',
        horario_abertura: '09:00',
        horario_fechamento: '20:00'
    },
    profissionais: [
        { id: 'prof-001', nome: 'Carlos', foto: null },
        { id: 'prof-002', nome: 'Pedro', foto: null },
        { id: 'prof-003', nome: 'Lucas', foto: null },
        { id: 'prof-004', nome: 'Rafael', foto: null }
    ],
    servicos: [
        { id: 'serv-001', nome: 'Corte Masculino', preco: 45.00, duracao: 30, icone: 'scissors' },
        { id: 'serv-002', nome: 'Barba Completa', preco: 35.00, duracao: 25, icone: 'smile' },
        { id: 'serv-003', nome: 'Corte + Barba', preco: 70.00, duracao: 50, icone: 'star' },
        { id: 'serv-004', nome: 'Sobrancelha', preco: 15.00, duracao: 15, icone: 'eye' },
        { id: 'serv-005', nome: 'Pigmentacao', preco: 80.00, duracao: 45, icone: 'palette' }
    ]
};

// Estado da aplicacao
const state = {
    selectedDate: null,
    selectedProfissional: null,
    selectedHorario: null,
    selectedServico: null
};

// ============================================
// INICIALIZACAO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    renderBarbearia();
    renderDatePicker();
    renderProfissionais();
    setupEventListeners();

    // Selecionar primeira data por padrao
    const today = new Date();
    selectDate(formatDate(today));
}

function setupEventListeners() {
    // Botao rota
    document.getElementById('btnRota')?.addEventListener('click', () => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(DEMO_DATA.barbearia.endereco)}`, '_blank');
    });

    // Botao ligar
    document.getElementById('btnLigar')?.addEventListener('click', () => {
        window.location.href = `tel:${DEMO_DATA.barbearia.telefone.replace(/\D/g, '')}`;
    });

    // Modal close
    document.getElementById('modalClose')?.addEventListener('click', closeModal);

    // Confirmar agendamento
    document.getElementById('btnConfirmar')?.addEventListener('click', confirmarAgendamento);

    // Novo agendamento
    document.getElementById('btnNovo')?.addEventListener('click', novoAgendamento);

    // Fechar modal clicando fora
    document.getElementById('modalConfirmacao')?.addEventListener('click', (e) => {
        if (e.target.id === 'modalConfirmacao') closeModal();
    });
}

// ============================================
// RENDERIZACAO
// ============================================

function renderBarbearia() {
    const b = DEMO_DATA.barbearia;

    document.getElementById('barbeariaNome').textContent = b.nome;
    document.getElementById('barbeariaEndereco').textContent = b.endereco;
    document.getElementById('barbeariaAvatar').textContent = b.nome.split(' ').map(w => w[0]).join('').substring(0, 2);
}

function renderDatePicker() {
    const container = document.getElementById('datePicker');
    if (!container) return;

    const dates = [];
    const today = new Date();
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Gerar proximos 14 dias
    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date);
    }

    container.innerHTML = dates.map((date, index) => {
        const dateStr = formatDate(date);
        return `
            <div class="date-item ${index === 0 ? 'selected' : ''}"
                 data-date="${dateStr}"
                 onclick="selectDate('${dateStr}')">
                <div class="date-weekday">${weekDays[date.getDay()]}</div>
                <div class="date-day">${date.getDate()}</div>
                <div class="date-month">${months[date.getMonth()]}</div>
            </div>
        `;
    }).join('');
}

function renderProfissionais() {
    const container = document.getElementById('profissionaisList');
    if (!container) return;

    container.innerHTML = DEMO_DATA.profissionais.map(prof => `
        <div class="profissional-item" data-id="${prof.id}" onclick="selectProfissional('${prof.id}')">
            <div class="profissional-avatar">
                ${prof.foto
                    ? `<img src="${prof.foto}" alt="${prof.nome}">`
                    : prof.nome.charAt(0)}
            </div>
            <div class="profissional-nome">${prof.nome}</div>
        </div>
    `).join('');
}

function renderHorarios() {
    const section = document.getElementById('horariosSection');
    const manhaCont = document.getElementById('horariosManha');
    const tardeCont = document.getElementById('horariosTarde');
    const noiteCont = document.getElementById('horariosNoite');

    if (!state.selectedProfissional || !state.selectedDate) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    // Gerar horarios
    const horarios = generateHorarios();

    // Separar por periodo
    const manha = horarios.filter(h => {
        const hora = parseInt(h.hora.split(':')[0]);
        return hora >= 9 && hora < 12;
    });

    const tarde = horarios.filter(h => {
        const hora = parseInt(h.hora.split(':')[0]);
        return hora >= 12 && hora < 18;
    });

    const noite = horarios.filter(h => {
        const hora = parseInt(h.hora.split(':')[0]);
        return hora >= 18;
    });

    manhaCont.innerHTML = renderHorariosGrid(manha);
    tardeCont.innerHTML = renderHorariosGrid(tarde);
    noiteCont.innerHTML = renderHorariosGrid(noite);

    // Recriar icones
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function renderHorariosGrid(horarios) {
    if (horarios.length === 0) {
        return '<p style="color: var(--gray); font-size: 0.875rem; grid-column: 1/-1;">Sem horarios</p>';
    }

    return horarios.map(h => `
        <div class="horario-item ${h.disponivel ? '' : 'disabled'} ${state.selectedHorario === h.hora ? 'selected' : ''}"
             data-hora="${h.hora}"
             onclick="${h.disponivel ? `selectHorario('${h.hora}')` : ''}">
            ${h.hora}
        </div>
    `).join('');
}

function renderServicos() {
    const section = document.getElementById('servicosSection');
    const container = document.getElementById('servicosList');
    const paymentSection = document.getElementById('paymentSection');

    if (!state.selectedHorario) {
        section.style.display = 'none';
        paymentSection.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    paymentSection.style.display = 'block';

    container.innerHTML = DEMO_DATA.servicos.map(serv => `
        <div class="servico-item">
            <div class="servico-info">
                <div class="servico-icon">
                    <i data-lucide="${serv.icone}"></i>
                </div>
                <div class="servico-details">
                    <h3>${serv.nome}</h3>
                    <div class="servico-meta">
                        <span class="servico-preco">R$ ${serv.preco.toFixed(2)}</span>
                        <span>${serv.duracao} min</span>
                    </div>
                </div>
            </div>
            <button class="btn-agendar" onclick="agendar('${serv.id}')">
                Agendar
            </button>
        </div>
    `).join('');

    // Recriar icones
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ============================================
// SELECAO
// ============================================

function selectDate(dateStr) {
    state.selectedDate = dateStr;
    state.selectedHorario = null;

    // Atualizar UI
    document.querySelectorAll('.date-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.date === dateStr);
    });

    renderHorarios();
    renderServicos();
}

function selectProfissional(profId) {
    state.selectedProfissional = profId;
    state.selectedHorario = null;

    // Atualizar UI
    document.querySelectorAll('.profissional-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.id === profId);
    });

    renderHorarios();
    renderServicos();
}

function selectHorario(hora) {
    state.selectedHorario = hora;

    // Atualizar UI
    document.querySelectorAll('.horario-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.hora === hora);
    });

    renderServicos();

    // Scroll para servicos
    document.getElementById('servicosSection')?.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// AGENDAMENTO
// ============================================

function agendar(servicoId) {
    state.selectedServico = servicoId;

    const servico = DEMO_DATA.servicos.find(s => s.id === servicoId);
    const profissional = DEMO_DATA.profissionais.find(p => p.id === state.selectedProfissional);

    if (!servico || !profissional) return;

    // Formatar data
    const dateObj = new Date(state.selectedDate + 'T12:00:00');
    const dateFormatted = dateObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    // Preencher modal
    document.getElementById('resumoServico').textContent = servico.nome;
    document.getElementById('resumoProfissional').textContent = profissional.nome;
    document.getElementById('resumoData').textContent = dateFormatted;
    document.getElementById('resumoHorario').textContent = state.selectedHorario;
    document.getElementById('resumoPreco').textContent = `R$ ${servico.preco.toFixed(2)}`;

    // Abrir modal
    document.getElementById('modalConfirmacao').classList.add('active');

    // Recriar icones
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function confirmarAgendamento() {
    const nome = document.getElementById('clienteNome').value.trim();
    const whatsapp = document.getElementById('clienteWhatsapp').value.trim();

    if (!nome) {
        alert('Digite seu nome');
        return;
    }

    if (!whatsapp) {
        alert('Digite seu WhatsApp');
        return;
    }

    // Simular envio
    showLoading(true);

    setTimeout(() => {
        showLoading(false);
        closeModal();

        // Dados para modal de sucesso
        const dateObj = new Date(state.selectedDate + 'T12:00:00');
        const dateFormatted = dateObj.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
        const profissional = DEMO_DATA.profissionais.find(p => p.id === state.selectedProfissional);

        document.getElementById('sucessoData').textContent = dateFormatted;
        document.getElementById('sucessoHorario').textContent = state.selectedHorario;
        document.getElementById('sucessoProfissional').textContent = profissional?.nome || '-';

        // Abrir modal de sucesso
        document.getElementById('modalSucesso').classList.add('active');

        // Recriar icones
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 1500);
}

function novoAgendamento() {
    document.getElementById('modalSucesso').classList.remove('active');

    // Limpar estado
    state.selectedHorario = null;
    state.selectedServico = null;

    // Limpar formulario
    document.getElementById('clienteNome').value = '';
    document.getElementById('clienteWhatsapp').value = '';

    // Re-renderizar
    renderHorarios();
    renderServicos();

    // Scroll para topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeModal() {
    document.getElementById('modalConfirmacao').classList.remove('active');
}

// ============================================
// HELPERS
// ============================================

function generateHorarios() {
    const horarios = [];
    const horaInicio = 9;
    const horaFim = 20;
    const intervalo = 30;

    for (let h = horaInicio; h < horaFim; h++) {
        for (let m = 0; m < 60; m += intervalo) {
            const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            // Simular disponibilidade aleatoria (80% disponivel)
            const disponivel = Math.random() > 0.2;
            horarios.push({ hora, disponivel });
        }
    }

    return horarios;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.toggle('active', show);
    }
}

// Formatar telefone
document.addEventListener('input', (e) => {
    if (e.target.id === 'clienteWhatsapp') {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);

        if (value.length > 7) {
            value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        } else if (value.length > 0) {
            value = value.replace(/^(\d{0,2})/, '($1');
        }

        e.target.value = value;
    }
});
