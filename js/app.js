// ============================================
// BARBERX - App Cliente
// Sistema de Agendamentos
// ============================================

// ============================================
// DADOS DE DEMONSTRACAO (remover apos apresentacao)
// ============================================
const DEMO_DATA = {
    barbearia: {
        id: 'demo-001',
        nome: 'Barbearia Premium',
        slug: 'demo',
        cidade: 'Sao Paulo',
        estado: 'SP',
        telefone: '(11) 99999-9999',
        endereco: 'Av. Paulista, 1000',
        horario_abertura: '09:00',
        horario_fechamento: '20:00',
        intervalo_agendamento: 15
    },
    servicos: [
        { id: 'serv-001', nome: 'Corte Masculino', preco: 45.00, duracao_minutos: 30, descricao: '', ativo: true, ordem: 1 },
        { id: 'serv-002', nome: 'Barba', preco: 35.00, duracao_minutos: 25, descricao: '', ativo: true, ordem: 2 },
        { id: 'serv-003', nome: 'Corte + Barba', preco: 70.00, duracao_minutos: 50, descricao: '', ativo: true, ordem: 3 },
        { id: 'serv-004', nome: 'Sobrancelha', preco: 15.00, duracao_minutos: 15, descricao: '', ativo: true, ordem: 4 }
    ],
    profissionais: [
        { id: 'prof-001', nome: 'Carlos Silva', apelido: 'Carlos', cor_agenda: '#d4a853', ativo: true },
        { id: 'prof-002', nome: 'Pedro Santos', apelido: 'Pedro', cor_agenda: '#4a90d9', ativo: true },
        { id: 'prof-003', nome: 'Lucas Oliveira', apelido: 'Lucas', cor_agenda: '#50c878', ativo: true }
    ]
};

let isDemoMode = false;
// ============================================

// Estado da aplicacao
const AppState = {
    barbearia: null,
    servicos: [],
    profissionais: [],
    currentStep: 1,
    selectedService: null,
    selectedProfessional: null,
    selectedDate: null,
    selectedTime: null,
    availableSlots: [],
    cliente: {
        nome: '',
        email: '',
        telefone: ''
    }
};

// ============================================
// INICIALIZACAO
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Obter slug da URL
    const slug = getSlugFromUrl();

    if (!slug) {
        showError('Barbearia não encontrada', 'URL inválida');
        return;
    }

    showLoading(true);

    try {
        // MODO DEMO - nao precisa inicializar Supabase
        // await BarberXDB.initSupabase();

        // Carregar dados da barbearia (modo demo)
        await loadBarbearia(slug);

        // Carregar servicos e profissionais
        await Promise.all([
            loadServicos(),
            loadProfissionais()
        ]);

        // Renderizar interface
        renderHeader();
        renderServicos();
        renderProfissionais();
        generateDatePicker();

        // Mostrar passo 1
        showStep(1);

        // Configurar botoes de navegacao
        setupNavigation();

    } catch (error) {
        console.error('Erro ao inicializar app:', error);
        showError('Erro ao carregar', 'Tente novamente mais tarde');
    } finally {
        showLoading(false);
    }
});

// Configurar navegacao
function setupNavigation() {
    const btnAvancar = document.getElementById('btnAvancar');
    const btnVoltar = document.getElementById('btnVoltar');

    if (btnAvancar) {
        btnAvancar.addEventListener('click', () => {
            if (AppState.currentStep === 4) {
                confirmBooking();
            } else {
                nextStep();
            }
        });
    }

    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {
            prevStep();
        });
    }
}

function getSlugFromUrl() {
    const path = window.location.pathname;
    // Remove leading slash and get first segment
    const segments = path.split('/').filter(s => s);
    return segments[0] || null;
}

// ============================================
// CARREGAMENTO DE DADOS
// ============================================

async function loadBarbearia(slug) {
    // MODO DEMO - usar dados direto sem banco
    isDemoMode = true;
    AppState.barbearia = { ...DEMO_DATA.barbearia, slug: slug };
    document.title = `${AppState.barbearia.nome} - Agendamento`;
}

async function loadServicos() {
    // MODO DEMO - usar dados direto
    AppState.servicos = DEMO_DATA.servicos;
}

async function loadProfissionais() {
    // MODO DEMO - usar dados direto
    AppState.profissionais = DEMO_DATA.profissionais;
}

// ============================================
// RENDERIZACAO
// ============================================

function renderHeader() {
    const barbearia = AppState.barbearia;
    if (!barbearia) return;

    const headerInfo = document.querySelector('.barbearia-info');
    if (headerInfo) {
        headerInfo.innerHTML = `
            <div class="barbearia-logo-placeholder">${barbearia.nome.charAt(0)}</div>
            <div class="barbearia-details">
                <h1>${barbearia.nome}</h1>
                <p>${barbearia.cidade} - ${barbearia.estado}</p>
            </div>
        `;
    }
}

function renderServicos() {
    const container = document.getElementById('servicosGrid');
    if (!container) return;

    if (AppState.servicos.length === 0) {
        container.innerHTML = `
            <div class="no-slots">
                <p>Nenhum serviço disponível</p>
            </div>
        `;
        return;
    }

    container.innerHTML = AppState.servicos.map(servico => `
        <div class="service-card" data-id="${servico.id}" onclick="selectService('${servico.id}')">
            <div class="service-header">
                <span class="service-name">${servico.nome}</span>
                <span class="service-price">R$ ${parseFloat(servico.preco).toFixed(2)}</span>
            </div>
        </div>
    `).join('');
}

function renderProfissionais() {
    const container = document.getElementById('profissionaisGrid');
    if (!container) return;

    if (AppState.profissionais.length === 0) {
        container.innerHTML = `
            <div class="no-slots">
                <p>Nenhum profissional disponível</p>
            </div>
        `;
        return;
    }

    container.innerHTML = AppState.profissionais.map(prof => `
        <div class="professional-card" data-id="${prof.id}" onclick="selectProfessional('${prof.id}')">
            <div class="professional-avatar-placeholder" style="background: ${prof.cor_agenda || '#d4a853'}">
                ${(prof.apelido || prof.nome).charAt(0)}
            </div>
            <div class="professional-name">${prof.apelido || prof.nome}</div>
            <div class="professional-specialty">Barbeiro</div>
        </div>
    `).join('');
}

function generateDatePicker() {
    const container = document.getElementById('date-picker');
    if (!container) return;

    const dates = [];
    const today = new Date();

    // Gerar proximos 14 dias
    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date);
    }

    const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

    container.innerHTML = dates.map((date, index) => {
        const dateStr = date.toISOString().split('T')[0];
        return `
            <div class="date-item ${index === 0 ? 'selected' : ''}"
                 data-date="${dateStr}"
                 onclick="selectDate('${dateStr}')">
                <div class="date-day">${date.getDate()}</div>
                <div class="date-weekday">${weekDays[date.getDay()]}</div>
            </div>
        `;
    }).join('');

    // Selecionar hoje por padrao
    AppState.selectedDate = today.toISOString().split('T')[0];
}

function renderTimeSlots() {
    const container = document.getElementById('time-slots');
    if (!container) return;

    if (AppState.availableSlots.length === 0) {
        container.innerHTML = `
            <div class="no-slots">
                <p>Nenhum horário disponível para esta data</p>
            </div>
        `;
        return;
    }

    container.innerHTML = AppState.availableSlots.map(slot => `
        <div class="time-slot ${slot.disponivel ? '' : 'disabled'}"
             data-time="${slot.hora_inicio}"
             onclick="${slot.disponivel ? `selectTime('${slot.hora_inicio}', '${slot.hora_fim}')` : ''}">
            ${slot.hora_inicio}
        </div>
    `).join('');
}

function renderSummary() {
    const container = document.getElementById('booking-summary');
    if (!container) return;

    const servico = AppState.servicos.find(s => s.id === AppState.selectedService);
    const profissional = AppState.profissionais.find(p => p.id === AppState.selectedProfessional);

    if (!servico || !profissional) return;

    const dateObj = new Date(AppState.selectedDate + 'T12:00:00');
    const dateFormatted = dateObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    container.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Serviço</span>
            <span class="summary-value">${servico.nome}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Profissional</span>
            <span class="summary-value">${profissional.apelido || profissional.nome}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Data</span>
            <span class="summary-value">${dateFormatted}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Horário</span>
            <span class="summary-value">${AppState.selectedTime}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Duração</span>
            <span class="summary-value">${servico.duracao_minutos} minutos</span>
        </div>
        <div class="summary-total">
            <span class="summary-label">Total</span>
            <span class="summary-value">R$ ${parseFloat(servico.preco).toFixed(2)}</span>
        </div>
    `;
}

// ============================================
// SELECOES
// ============================================

function selectService(serviceId) {
    AppState.selectedService = serviceId;

    // Atualizar UI
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.id === serviceId);
    });

    // Habilitar botao de proximo
    updateNavigationButtons();
}

function selectProfessional(professionalId) {
    AppState.selectedProfessional = professionalId;

    // Atualizar UI
    document.querySelectorAll('.professional-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.id === professionalId);
    });

    // Habilitar botao de proximo
    updateNavigationButtons();
}

async function selectDate(dateStr) {
    AppState.selectedDate = dateStr;
    AppState.selectedTime = null;

    // Atualizar UI
    document.querySelectorAll('.date-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.date === dateStr);
    });

    // Carregar horarios disponiveis
    await loadAvailableSlots();
}

function selectTime(startTime, endTime) {
    AppState.selectedTime = startTime;
    AppState.selectedTimeEnd = endTime;

    // Atualizar UI
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.toggle('selected', slot.dataset.time === startTime);
    });

    // Habilitar botao de proximo
    updateNavigationButtons();
}

async function loadAvailableSlots() {
    if (!AppState.barbearia || !AppState.selectedProfessional || !AppState.selectedService) {
        return;
    }

    const servico = AppState.servicos.find(s => s.id === AppState.selectedService);
    if (!servico) return;

    try {
        // Se modo demo, gerar horarios ficticios
        if (isDemoMode) {
            AppState.availableSlots = generateDemoSlots(servico.duracao_minutos);
            renderTimeSlots();
            return;
        }

        AppState.availableSlots = await BarberXDB.getHorariosDisponiveis(
            AppState.barbearia.id,
            AppState.selectedProfessional,
            AppState.selectedDate,
            servico.duracao_minutos
        );

        renderTimeSlots();
    } catch (error) {
        console.error('Erro ao carregar horarios, usando demo:', error);
        AppState.availableSlots = generateDemoSlots(servico.duracao_minutos);
        renderTimeSlots();
    }
}

// Gerar horarios demo
function generateDemoSlots(duracaoMinutos) {
    const slots = [];
    const barbearia = DEMO_DATA.barbearia;
    const [horaAbertura, minAbertura] = barbearia.horario_abertura.split(':').map(Number);
    const [horaFechamento, minFechamento] = barbearia.horario_fechamento.split(':').map(Number);
    const intervalo = barbearia.intervalo_agendamento || 15;

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

        // Simular alguns horarios ocupados aleatoriamente
        const disponivel = Math.random() > 0.2;

        slots.push({
            hora_inicio: horaStr,
            hora_fim: horaFimStr,
            disponivel: disponivel
        });

        currentMinutes += intervalo;
    }

    return slots;
}

// ============================================
// NAVEGACAO ENTRE PASSOS
// ============================================

function showStep(step) {
    AppState.currentStep = step;

    // Esconder todas as secoes
    document.querySelectorAll('.booking-section').forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar secao atual
    const currentSection = document.getElementById(`step-${step}`);
    if (currentSection) {
        currentSection.classList.add('active');
    }

    // Atualizar indicadores de passo
    document.querySelectorAll('.step').forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index + 1 < step) {
            stepEl.classList.add('completed');
        } else if (index + 1 === step) {
            stepEl.classList.add('active');
        }
    });

    // Acoes especificas por passo
    if (step === 3) {
        loadAvailableSlots();
    } else if (step === 4) {
        renderSummary();
    }

    updateNavigationButtons();
}

function nextStep() {
    if (AppState.currentStep < 5) {
        showStep(AppState.currentStep + 1);
    }
}

function prevStep() {
    if (AppState.currentStep > 1) {
        showStep(AppState.currentStep - 1);
    }
}

function updateNavigationButtons() {
    const step = AppState.currentStep;

    // Botao proximo do passo 1 (servico)
    const btnStep1 = document.getElementById('btn-next-1');
    if (btnStep1) {
        btnStep1.disabled = !AppState.selectedService;
    }

    // Botao proximo do passo 2 (profissional)
    const btnStep2 = document.getElementById('btn-next-2');
    if (btnStep2) {
        btnStep2.disabled = !AppState.selectedProfessional;
    }

    // Botao proximo do passo 3 (data/hora)
    const btnStep3 = document.getElementById('btn-next-3');
    if (btnStep3) {
        btnStep3.disabled = !AppState.selectedTime;
    }
}

// ============================================
// CONFIRMACAO DO AGENDAMENTO
// ============================================

async function confirmBooking() {
    // Validar dados do cliente
    const nome = document.getElementById('client-name')?.value.trim();
    const email = document.getElementById('client-email')?.value.trim();
    const telefone = document.getElementById('client-phone')?.value.trim();

    if (!nome || !telefone) {
        showToast('Preencha seu nome e telefone', 'error');
        return;
    }

    AppState.cliente = { nome, email, telefone };

    const servico = AppState.servicos.find(s => s.id === AppState.selectedService);
    if (!servico) {
        showToast('Selecione um servico', 'error');
        return;
    }

    showLoading(true);

    try {
        // Modo DEMO - simular sucesso
        if (isDemoMode) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
            showStep(5);
            showToast('Agendamento realizado com sucesso!', 'success');
            showLoading(false);
            return;
        }

        // Criar ou atualizar cliente
        let cliente = null;
        if (email) {
            cliente = await BarberXDB.createOrUpdateCliente({
                nome: AppState.cliente.nome,
                email: AppState.cliente.email,
                telefone: AppState.cliente.telefone
            });
        }

        // Criar agendamento
        const agendamento = {
            barbearia_id: AppState.barbearia.id,
            profissional_id: AppState.selectedProfessional,
            servico_id: AppState.selectedService,
            cliente_id: cliente?.id || null,
            cliente_nome: AppState.cliente.nome,
            cliente_telefone: AppState.cliente.telefone,
            cliente_email: AppState.cliente.email || null,
            data: AppState.selectedDate,
            hora_inicio: AppState.selectedTime,
            hora_fim: AppState.selectedTimeEnd,
            preco: servico.preco,
            status: 'pendente'
        };

        await BarberXDB.createAgendamento(agendamento);

        // Mostrar tela de sucesso
        showStep(5);
        showToast('Agendamento realizado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao confirmar agendamento:', error);
        showToast('Erro ao agendar. Tente novamente.', 'error');
    } finally {
        showLoading(false);
    }
}

function newBooking() {
    // Resetar estado
    AppState.selectedService = null;
    AppState.selectedProfessional = null;
    AppState.selectedTime = null;
    AppState.cliente = { nome: '', email: '', telefone: '' };

    // Limpar selecoes
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));

    // Limpar formulario
    const nameInput = document.getElementById('client-name');
    const emailInput = document.getElementById('client-email');
    const phoneInput = document.getElementById('client-phone');
    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (phoneInput) phoneInput.value = '';

    // Voltar ao passo 1
    generateDatePicker();
    showStep(1);
}

// ============================================
// UI HELPERS
// ============================================

function showLoading(show) {
    const loading = document.getElementById('loading');
    const mainContent = document.getElementById('main-content');

    if (loading) {
        loading.classList.toggle('hidden', !show);
    }
    if (mainContent) {
        mainContent.classList.toggle('hidden', show);
    }
}

function showError(title, message) {
    const mainContent = document.getElementById('main-content');
    const loading = document.getElementById('loading');

    if (loading) loading.classList.add('hidden');

    if (mainContent) {
        mainContent.innerHTML = `
            <div class="error-state">
                <div class="error-icon">😕</div>
                <h3>${title}</h3>
                <p>${message}</p>
                <a href="https://barber.xrtec1.com" class="btn btn-primary" style="margin-top: 24px; display: inline-flex;">
                    Voltar ao início
                </a>
            </div>
        `;
        mainContent.classList.remove('hidden');
    }
}

function showToast(message, type = 'success') {
    // Remover toast existente
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✓' : '✕'}</span>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // Animar entrada
    setTimeout(() => toast.classList.add('show'), 10);

    // Remover apos 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// FORMATACAO
// ============================================

function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.length > 11) {
        value = value.substring(0, 11);
    }

    if (value.length > 7) {
        value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (value.length > 0) {
        value = value.replace(/^(\d{0,2})/, '($1');
    }

    input.value = value;
}
