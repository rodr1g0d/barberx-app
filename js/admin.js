// ============================================
// BARBERX - Admin Panel JavaScript
// ============================================

// ============================================
// MOCK DATA (Replace with Supabase)
// ============================================

const mockData = {
    barbearia: {
        id: '1',
        nome: 'Barbearia Teste',
        slug: 'barbearia-teste',
        telefone: '(11) 99999-9999',
        email: 'contato@barbearia.com',
        horario_abertura: '08:00',
        horario_fechamento: '20:00'
    },
    profissionais: [
        { id: '1', nome: 'Joao Silva', apelido: 'Joao', foto_url: null, comissao_percentual: 50, cor_agenda: '#d4a853', ativo: true },
        { id: '2', nome: 'Pedro Santos', apelido: 'Pedrao', foto_url: null, comissao_percentual: 50, cor_agenda: '#3b82f6', ativo: true },
        { id: '3', nome: 'Carlos Oliveira', apelido: 'Carlao', foto_url: null, comissao_percentual: 45, cor_agenda: '#22c55e', ativo: true }
    ],
    servicos: [
        { id: '1', nome: 'Corte Masculino', preco: 45.00, duracao_minutos: 30, categoria: 'corte', descricao: 'Corte tradicional masculino', ativo: true },
        { id: '2', nome: 'Barba', preco: 30.00, duracao_minutos: 20, categoria: 'barba', descricao: 'Aparar e modelar a barba', ativo: true },
        { id: '3', nome: 'Corte + Barba', preco: 65.00, duracao_minutos: 45, categoria: 'combo', descricao: 'Combo completo', ativo: true },
        { id: '4', nome: 'Platinado', preco: 150.00, duracao_minutos: 90, categoria: 'coloracao', descricao: 'Descoloracao completa', ativo: true },
        { id: '5', nome: 'Pigmentacao', preco: 80.00, duracao_minutos: 60, categoria: 'coloracao', descricao: 'Pigmentacao da barba', ativo: true }
    ],
    clientes: [
        { id: '1', nome: 'Lucas Ferreira', telefone: '(11) 98888-1111', email: 'lucas@email.com', agendamentos: 12, ultimo_atendimento: '2026-01-15' },
        { id: '2', nome: 'Rafael Costa', telefone: '(11) 98888-2222', email: 'rafael@email.com', agendamentos: 8, ultimo_atendimento: '2026-01-18' },
        { id: '3', nome: 'Bruno Almeida', telefone: '(11) 98888-3333', email: 'bruno@email.com', agendamentos: 5, ultimo_atendimento: '2026-01-10' },
        { id: '4', nome: 'Marcos Lima', telefone: '(11) 98888-4444', email: 'marcos@email.com', agendamentos: 3, ultimo_atendimento: '2026-01-05' },
        { id: '5', nome: 'Felipe Souza', telefone: '(11) 98888-5555', email: 'felipe@email.com', agendamentos: 15, ultimo_atendimento: '2026-01-19' }
    ],
    agendamentos: [
        { id: '1', cliente_nome: 'Lucas Ferreira', servico_id: '1', profissional_id: '1', data: '2026-01-19', hora_inicio: '09:00', hora_fim: '09:30', preco: 45.00, status: 'confirmado' },
        { id: '2', cliente_nome: 'Rafael Costa', servico_id: '3', profissional_id: '2', data: '2026-01-19', hora_inicio: '10:00', hora_fim: '10:45', preco: 65.00, status: 'confirmado' },
        { id: '3', cliente_nome: 'Bruno Almeida', servico_id: '2', profissional_id: '1', data: '2026-01-19', hora_inicio: '11:00', hora_fim: '11:20', preco: 30.00, status: 'pendente' },
        { id: '4', cliente_nome: 'Marcos Lima', servico_id: '1', profissional_id: '3', data: '2026-01-19', hora_inicio: '14:00', hora_fim: '14:30', preco: 45.00, status: 'confirmado' },
        { id: '5', cliente_nome: 'Felipe Souza', servico_id: '4', profissional_id: '2', data: '2026-01-19', hora_inicio: '15:00', hora_fim: '16:30', preco: 150.00, status: 'confirmado' },
        { id: '6', cliente_nome: 'Andre Santos', servico_id: '1', profissional_id: '1', data: '2026-01-20', hora_inicio: '09:00', hora_fim: '09:30', preco: 45.00, status: 'pendente' },
        { id: '7', cliente_nome: 'Thiago Oliveira', servico_id: '3', profissional_id: '3', data: '2026-01-20', hora_inicio: '10:00', hora_fim: '10:45', preco: 65.00, status: 'confirmado' }
    ]
};

// ============================================
// STATE
// ============================================

const state = {
    currentPage: 'dashboard',
    currentWeekStart: getWeekStart(new Date()),
    selectedDate: new Date(),
    sidebarCollapsed: false
};

// ============================================
// UTILITIES
// ============================================

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatDateFull(date) {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function getAvatarUrl(name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=d4a853&color=0a0a0a&bold=true`;
}

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const cardLinks = document.querySelectorAll('.card-link[data-page]');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });

    cardLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // Update page visibility
    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.id === `page-${page}`);
    });

    // Update title
    const titles = {
        dashboard: 'Dashboard',
        agenda: 'Agenda',
        clientes: 'Clientes',
        servicos: 'Servicos',
        profissionais: 'Profissionais',
        financeiro: 'Financeiro',
        relatorios: 'Relatorios',
        configuracoes: 'Configuracoes'
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;

    state.currentPage = page;

    // Load page-specific data
    if (page === 'agenda') {
        renderAgenda();
    } else if (page === 'clientes') {
        renderClientes();
    } else if (page === 'servicos') {
        renderServicos();
    } else if (page === 'profissionais') {
        renderProfissionais();
    } else if (page === 'financeiro') {
        renderFinanceiro();
    }

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
}

// ============================================
// SIDEBAR
// ============================================

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        state.sidebarCollapsed = sidebar.classList.contains('collapsed');
    });

    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close sidebar on outside click (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
}

// ============================================
// DASHBOARD
// ============================================

function renderDashboard() {
    // Update date
    document.getElementById('currentDate').textContent = formatDateFull(new Date());

    // Calculate stats
    const today = new Date().toISOString().split('T')[0];
    const agendamentosHoje = mockData.agendamentos.filter(a => a.data === today);
    const faturamentoHoje = agendamentosHoje.reduce((sum, a) => sum + a.preco, 0);
    const clientesMes = new Set(mockData.agendamentos.map(a => a.cliente_nome)).size;

    // Update stats
    document.getElementById('statAgendamentosHoje').textContent = agendamentosHoje.length;
    document.getElementById('statFaturamentoHoje').textContent = formatCurrency(faturamentoHoje);
    document.getElementById('statClientesMes').textContent = clientesMes;
    document.getElementById('statAvaliacao').textContent = '4.8';

    // Render upcoming appointments
    renderProximosAgendamentos();

    // Render popular services
    renderServicosPopulares();

    // Render professionals today
    renderProfissionaisHoje();

    // Render revenue chart
    renderRevenueChart();
}

function renderProximosAgendamentos() {
    const container = document.getElementById('proximosAgendamentos');
    const today = new Date().toISOString().split('T')[0];
    const proximos = mockData.agendamentos
        .filter(a => a.data >= today && a.status !== 'cancelado')
        .sort((a, b) => {
            if (a.data !== b.data) return a.data.localeCompare(b.data);
            return a.hora_inicio.localeCompare(b.hora_inicio);
        })
        .slice(0, 5);

    if (proximos.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Nenhum agendamento</p>';
        return;
    }

    container.innerHTML = proximos.map(a => {
        const servico = mockData.servicos.find(s => s.id === a.servico_id);
        const profissional = mockData.profissionais.find(p => p.id === a.profissional_id);

        return `
            <div class="appointment-item">
                <span class="appointment-time">${a.hora_inicio}</span>
                <div class="appointment-info">
                    <div class="appointment-client">${a.cliente_nome}</div>
                    <div class="appointment-service">${servico?.nome || 'Servico'}</div>
                </div>
                <div class="appointment-professional">
                    <img src="${getAvatarUrl(profissional?.nome || 'P')}" alt="${profissional?.apelido}">
                    <span>${profissional?.apelido || 'Profissional'}</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderServicosPopulares() {
    const container = document.getElementById('servicosPopulares');

    // Count services
    const serviceCounts = {};
    mockData.agendamentos.forEach(a => {
        serviceCounts[a.servico_id] = (serviceCounts[a.servico_id] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(serviceCounts));
    const sortedServices = Object.entries(serviceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    container.innerHTML = sortedServices.map(([servicoId, count], index) => {
        const servico = mockData.servicos.find(s => s.id === servicoId);
        const percentage = (count / maxCount) * 100;

        return `
            <div class="service-rank-item">
                <span class="service-rank">${index + 1}</span>
                <div class="service-rank-info">
                    <div class="service-rank-name">${servico?.nome || 'Servico'}</div>
                    <div class="service-rank-bar">
                        <div class="service-rank-progress" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <span class="service-rank-count">${count}</span>
            </div>
        `;
    }).join('');
}

function renderProfissionaisHoje() {
    const container = document.getElementById('profissionaisHoje');
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);

    container.innerHTML = mockData.profissionais.filter(p => p.ativo).map(p => {
        const agendamentosHoje = mockData.agendamentos.filter(a =>
            a.profissional_id === p.id && a.data === today && a.status !== 'cancelado'
        );

        const emAtendimento = agendamentosHoje.some(a =>
            a.hora_inicio <= now && a.hora_fim > now
        );

        return `
            <div class="professional-today-item">
                <img src="${getAvatarUrl(p.nome)}" alt="${p.apelido}" class="professional-avatar">
                <div class="professional-info">
                    <div class="professional-name">${p.apelido || p.nome}</div>
                    <div class="professional-stats">${agendamentosHoje.length} agendamentos hoje</div>
                </div>
                <span class="professional-status ${emAtendimento ? 'busy' : 'available'}">
                    ${emAtendimento ? 'Ocupado' : 'Disponivel'}
                </span>
            </div>
        `;
    }).join('');
}

function renderRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
    const data = [450, 380, 520, 490, 610, 720, 0]; // Mock data

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Faturamento',
                data,
                backgroundColor: 'rgba(212, 168, 83, 0.8)',
                borderColor: '#d4a853',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666666'
                    }
                },
                y: {
                    grid: {
                        color: '#2a2a2a'
                    },
                    ticks: {
                        color: '#666666',
                        callback: (value) => 'R$ ' + value
                    }
                }
            }
        }
    });
}

// ============================================
// AGENDA
// ============================================

function renderAgenda() {
    renderCalendarHeader();
    renderTimeColumn();
    renderDaysGrid();
    populateProfissionaisFilter();
}

function renderCalendarHeader() {
    const container = document.getElementById('calendarHeader');
    const days = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(state.currentWeekStart);
        date.setDate(date.getDate() + i);
        days.push(date);
    }

    const today = new Date().toISOString().split('T')[0];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

    container.innerHTML = `
        <div class="calendar-header-cell"></div>
        ${days.map(d => {
            const dateStr = d.toISOString().split('T')[0];
            const isToday = dateStr === today;
            return `
                <div class="calendar-header-cell ${isToday ? 'today' : ''}">
                    <div class="calendar-day-name">${dayNames[d.getDay()]}</div>
                    <div class="calendar-day-number">${d.getDate()}</div>
                </div>
            `;
        }).join('')}
    `;

    // Update period text
    const monthNames = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    document.getElementById('agendaPeriod').textContent =
        `${monthNames[state.currentWeekStart.getMonth()]} ${state.currentWeekStart.getFullYear()}`;
}

function renderTimeColumn() {
    const container = document.getElementById('timeColumn');
    const hours = [];

    for (let h = 8; h <= 20; h++) {
        hours.push(`${h.toString().padStart(2, '0')}:00`);
    }

    container.innerHTML = hours.map(h => `
        <div class="time-slot">${h}</div>
    `).join('');
}

function renderDaysGrid() {
    const container = document.getElementById('daysGrid');
    const days = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(state.currentWeekStart);
        date.setDate(date.getDate() + i);
        days.push(date);
    }

    container.innerHTML = days.map(d => {
        const dateStr = d.toISOString().split('T')[0];
        const dayAgendamentos = mockData.agendamentos.filter(a => a.data === dateStr);

        let hoursHtml = '';
        for (let h = 8; h <= 20; h++) {
            const hourStr = `${h.toString().padStart(2, '0')}:00`;

            // Find appointments that start at this hour
            const hourEvents = dayAgendamentos.filter(a => {
                const startHour = parseInt(a.hora_inicio.split(':')[0]);
                return startHour === h;
            });

            let eventsHtml = '';
            hourEvents.forEach(a => {
                const servico = mockData.servicos.find(s => s.id === a.servico_id);
                const profissional = mockData.profissionais.find(p => p.id === a.profissional_id);

                // Calculate height based on duration
                const startParts = a.hora_inicio.split(':');
                const endParts = a.hora_fim.split(':');
                const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
                const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
                const durationMinutes = endMinutes - startMinutes;
                const heightPx = (durationMinutes / 60) * 60 - 4;

                const startMinuteOffset = parseInt(startParts[1]);
                const topOffset = (startMinuteOffset / 60) * 60;

                eventsHtml += `
                    <div class="calendar-event" style="height: ${heightPx}px; top: ${topOffset}px; background: ${profissional?.cor_agenda || '#d4a853'}">
                        <div class="calendar-event-client">${a.cliente_nome}</div>
                        <div class="calendar-event-service">${servico?.nome || 'Servico'}</div>
                    </div>
                `;
            });

            hoursHtml += `<div class="hour-cell">${eventsHtml}</div>`;
        }

        return `<div class="day-column">${hoursHtml}</div>`;
    }).join('');
}

function populateProfissionaisFilter() {
    const select = document.getElementById('filterProfissional');
    select.innerHTML = `
        <option value="">Todos Profissionais</option>
        ${mockData.profissionais.filter(p => p.ativo).map(p => `
            <option value="${p.id}">${p.apelido || p.nome}</option>
        `).join('')}
    `;
}

function initAgendaNavigation() {
    document.getElementById('prevWeek').addEventListener('click', () => {
        state.currentWeekStart.setDate(state.currentWeekStart.getDate() - 7);
        renderAgenda();
    });

    document.getElementById('nextWeek').addEventListener('click', () => {
        state.currentWeekStart.setDate(state.currentWeekStart.getDate() + 7);
        renderAgenda();
    });
}

// ============================================
// CLIENTES
// ============================================

function renderClientes() {
    const tbody = document.getElementById('clientesTableBody');

    tbody.innerHTML = mockData.clientes.map(c => `
        <tr>
            <td>
                <div class="client-cell">
                    <img src="${getAvatarUrl(c.nome)}" alt="${c.nome}">
                    <span>${c.nome}</span>
                </div>
            </td>
            <td>${c.telefone}</td>
            <td>${c.email}</td>
            <td>${c.agendamentos}</td>
            <td>${new Date(c.ultimo_atendimento).toLocaleDateString('pt-BR')}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn" title="Historico">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ============================================
// SERVICOS
// ============================================

function renderServicos() {
    const grid = document.getElementById('servicosGrid');

    grid.innerHTML = mockData.servicos.filter(s => s.ativo).map(s => `
        <div class="service-card">
            <div class="service-card-header">
                <span class="service-category">${s.categoria}</span>
                <div class="service-actions">
                    <button class="action-btn" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn delete" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
            <h4 class="service-name">${s.nome}</h4>
            <p class="service-description">${s.descricao || 'Sem descricao'}</p>
            <div class="service-footer">
                <span class="service-price">${formatCurrency(s.preco)}</span>
                <span class="service-duration">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    ${s.duracao_minutos} min
                </span>
            </div>
        </div>
    `).join('');
}

// ============================================
// PROFISSIONAIS
// ============================================

function renderProfissionais() {
    const grid = document.getElementById('profissionaisGrid');

    grid.innerHTML = mockData.profissionais.map(p => {
        // Calculate stats
        const agendamentos = mockData.agendamentos.filter(a => a.profissional_id === p.id);
        const faturamento = agendamentos.reduce((sum, a) => sum + a.preco, 0);

        return `
            <div class="professional-card">
                <img src="${getAvatarUrl(p.nome)}" alt="${p.nome}" class="professional-card-avatar">
                <h4 class="professional-card-name">${p.nome}</h4>
                <p class="professional-card-nickname">${p.apelido || ''}</p>
                <div class="professional-card-stats">
                    <div class="professional-stat">
                        <span class="professional-stat-value">${agendamentos.length}</span>
                        <span class="professional-stat-label">Atendimentos</span>
                    </div>
                    <div class="professional-stat">
                        <span class="professional-stat-value">${formatCurrency(faturamento)}</span>
                        <span class="professional-stat-label">Faturamento</span>
                    </div>
                    <div class="professional-stat">
                        <span class="professional-stat-value">${p.comissao_percentual}%</span>
                        <span class="professional-stat-label">Comissao</span>
                    </div>
                </div>
                <div class="professional-card-actions">
                    <button class="btn-secondary">Editar</button>
                    <button class="btn-secondary">Agenda</button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// FINANCEIRO
// ============================================

function renderFinanceiro() {
    // Calculate totals
    const faturamentoMes = mockData.agendamentos.reduce((sum, a) => sum + a.preco, 0);
    const ticketMedio = faturamentoMes / mockData.agendamentos.length || 0;
    const comissoes = mockData.profissionais.reduce((sum, p) => {
        const profAgendamentos = mockData.agendamentos.filter(a => a.profissional_id === p.id);
        const profFaturamento = profAgendamentos.reduce((s, a) => s + a.preco, 0);
        return sum + (profFaturamento * p.comissao_percentual / 100);
    }, 0);

    document.getElementById('faturamentoMes').textContent = formatCurrency(faturamentoMes);
    document.getElementById('ticketMedio').textContent = formatCurrency(ticketMedio);
    document.getElementById('totalAtendimentos').textContent = mockData.agendamentos.length;
    document.getElementById('comissoesPagar').textContent = formatCurrency(comissoes);

    // Render transactions table
    const tbody = document.getElementById('movimentacoesTableBody');

    tbody.innerHTML = mockData.agendamentos
        .filter(a => a.status === 'confirmado' || a.status === 'concluido')
        .sort((a, b) => b.data.localeCompare(a.data))
        .map(a => {
            const servico = mockData.servicos.find(s => s.id === a.servico_id);
            const profissional = mockData.profissionais.find(p => p.id === a.profissional_id);

            return `
                <tr>
                    <td>${new Date(a.data).toLocaleDateString('pt-BR')}</td>
                    <td>${a.cliente_nome}</td>
                    <td>${servico?.nome || 'Servico'}</td>
                    <td>${profissional?.apelido || profissional?.nome || 'Profissional'}</td>
                    <td>PIX</td>
                    <td style="color: var(--success); font-weight: 600;">${formatCurrency(a.preco)}</td>
                </tr>
            `;
        }).join('');
}

// ============================================
// MODALS
// ============================================

function initModals() {
    // New appointment button
    document.getElementById('novoAgendamentoBtn')?.addEventListener('click', () => {
        openModal('modalAgendamento');
        populateAgendamentoModal();
    });

    // New service button
    document.getElementById('novoServicoBtn')?.addEventListener('click', () => {
        openModal('modalServico');
    });

    // New professional button
    document.getElementById('novoProfissionalBtn')?.addEventListener('click', () => {
        openModal('modalProfissional');
        populateProfissionalModal();
    });

    // Close buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.close;
            closeModal(modalId);
        });
    });

    // Close on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Form submissions
    document.getElementById('formAgendamento')?.addEventListener('submit', handleAgendamentoSubmit);
    document.getElementById('formServico')?.addEventListener('submit', handleServicoSubmit);
    document.getElementById('formProfissional')?.addEventListener('submit', handleProfissionalSubmit);
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function populateAgendamentoModal() {
    // Populate services
    const servicoSelect = document.getElementById('agendamentoServico');
    servicoSelect.innerHTML = `
        <option value="">Selecione um servico</option>
        ${mockData.servicos.filter(s => s.ativo).map(s => `
            <option value="${s.id}">${s.nome} - ${formatCurrency(s.preco)}</option>
        `).join('')}
    `;

    // Populate professionals
    const profissionalSelect = document.getElementById('agendamentoProfissional');
    profissionalSelect.innerHTML = `
        <option value="">Selecione um profissional</option>
        ${mockData.profissionais.filter(p => p.ativo).map(p => `
            <option value="${p.id}">${p.apelido || p.nome}</option>
        `).join('')}
    `;

    // Set default date
    document.getElementById('agendamentoData').valueAsDate = new Date();

    // Populate time slots
    populateTimeSlots();
}

function populateTimeSlots() {
    const horarioSelect = document.getElementById('agendamentoHorario');
    const slots = [];

    for (let h = 8; h < 20; h++) {
        slots.push(`${h.toString().padStart(2, '0')}:00`);
        slots.push(`${h.toString().padStart(2, '0')}:30`);
    }

    horarioSelect.innerHTML = `
        <option value="">Selecione</option>
        ${slots.map(s => `<option value="${s}">${s}</option>`).join('')}
    `;
}

function populateProfissionalModal() {
    const container = document.getElementById('profissionalServicos');
    container.innerHTML = mockData.servicos.filter(s => s.ativo).map(s => `
        <label>
            <input type="checkbox" value="${s.id}" checked>
            ${s.nome}
        </label>
    `).join('');
}

function handleAgendamentoSubmit(e) {
    e.preventDefault();

    const cliente = document.getElementById('agendamentoCliente').value;
    const servicoId = document.getElementById('agendamentoServico').value;
    const profissionalId = document.getElementById('agendamentoProfissional').value;
    const data = document.getElementById('agendamentoData').value;
    const horario = document.getElementById('agendamentoHorario').value;

    if (!cliente || !servicoId || !profissionalId || !data || !horario) {
        alert('Preencha todos os campos obrigatorios');
        return;
    }

    const servico = mockData.servicos.find(s => s.id === servicoId);
    const [startHour, startMin] = horario.split(':').map(Number);
    const endMinutes = startHour * 60 + startMin + servico.duracao_minutos;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const horaFim = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

    // Add to mock data
    mockData.agendamentos.push({
        id: String(mockData.agendamentos.length + 1),
        cliente_nome: cliente,
        cliente_telefone: document.getElementById('agendamentoTelefone').value,
        cliente_email: document.getElementById('agendamentoEmail').value,
        servico_id: servicoId,
        profissional_id: profissionalId,
        data: data,
        hora_inicio: horario,
        hora_fim: horaFim,
        preco: servico.preco,
        status: 'pendente',
        observacoes: document.getElementById('agendamentoObs').value
    });

    closeModal('modalAgendamento');
    e.target.reset();

    // Refresh relevant pages
    if (state.currentPage === 'agenda') {
        renderAgenda();
    } else if (state.currentPage === 'dashboard') {
        renderDashboard();
    }

    alert('Agendamento criado com sucesso!');
}

function handleServicoSubmit(e) {
    e.preventDefault();

    const nome = document.getElementById('servicoNome').value;
    const preco = parseFloat(document.getElementById('servicoPreco').value);
    const duracao = parseInt(document.getElementById('servicoDuracao').value);
    const categoria = document.getElementById('servicoCategoria').value;
    const descricao = document.getElementById('servicoDescricao').value;

    if (!nome || !preco || !duracao) {
        alert('Preencha todos os campos obrigatorios');
        return;
    }

    mockData.servicos.push({
        id: String(mockData.servicos.length + 1),
        nome,
        preco,
        duracao_minutos: duracao,
        categoria,
        descricao,
        ativo: true
    });

    closeModal('modalServico');
    e.target.reset();

    if (state.currentPage === 'servicos') {
        renderServicos();
    }

    alert('Servico criado com sucesso!');
}

function handleProfissionalSubmit(e) {
    e.preventDefault();

    const nome = document.getElementById('profissionalNome').value;
    const apelido = document.getElementById('profissionalApelido').value;
    const comissao = parseFloat(document.getElementById('profissionalComissao').value);
    const cor = document.getElementById('profissionalCor').value;

    if (!nome) {
        alert('Preencha o nome do profissional');
        return;
    }

    mockData.profissionais.push({
        id: String(mockData.profissionais.length + 1),
        nome,
        apelido,
        foto_url: null,
        comissao_percentual: comissao || 50,
        cor_agenda: cor,
        ativo: true
    });

    closeModal('modalProfissional');
    e.target.reset();

    if (state.currentPage === 'profissionais') {
        renderProfissionais();
    }

    alert('Profissional criado com sucesso!');
}

// ============================================
// SETTINGS
// ============================================

function initSettings() {
    // Settings tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const settingsId = tab.dataset.settings;

            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`settings-${settingsId}`).classList.add('active');
        });
    });

    // Service tabs
    document.querySelectorAll('.tabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Could filter services by active/inactive here
        });
    });

    // Schedule day checkboxes
    document.querySelectorAll('.day-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const row = checkbox.closest('.schedule-row');
            const timeInputs = row.querySelectorAll('input[type="time"]');
            timeInputs.forEach(input => input.disabled = !checkbox.checked);
        });
    });

    // Form submissions
    document.getElementById('formDadosBarbearia')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Dados salvos com sucesso!');
    });

    document.getElementById('formHorarios')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Horarios salvos com sucesso!');
    });

    document.getElementById('formPagamentos')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Configuracoes de pagamento salvas!');
    });

    document.getElementById('formNotificacoes')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Configuracoes de notificacoes salvas!');
    });
}

// ============================================
// SEARCH
// ============================================

function initSearch() {
    const searchInput = document.getElementById('searchCliente');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#clientesTableBody tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSidebar();
    initModals();
    initSettings();
    initSearch();
    initAgendaNavigation();

    // Render initial page
    renderDashboard();
});
