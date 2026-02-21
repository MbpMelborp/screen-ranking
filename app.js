document.addEventListener("alpine:init", () => {
  Alpine.store("dashboard", {
    // Estado reactivo
    visitors: 0,
    investment: { labels: [], series: [] },
    investmentTotal: 0,
    ranking: [],
    currentPage: 0,
    pageSize: 5,
    progress: 0,
    rotationInterval: 10000,
    lastUpdate: null,
    aspectRatio: "3 / 1",

    _chartInstance: null,
    _progressInterval: null,
    _rotationInterval: null,
    _demoIndex: 0,
    _rankingInitialized: false,

    // Getters
    get totalPages() {
      const n = this.ranking.length;
      return n ? Math.ceil(n / this.pageSize) : 1;
    },

    get currentPageItems() {
      const start = this.currentPage * this.pageSize;
      return this.ranking.slice(start, start + this.pageSize);
    },

    get formattedInvestment() {
      return this.formatCurrency(this.investmentTotal);
    },

    get formattedVisitors() {
      return this.formatVisitors(this.visitors);
    },

    // Formateadores
    formatCurrency(value) {
      const num = Number(value);
      if (isNaN(num)) return "$0";
      const int = Math.floor(num);
      const str = int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return `$${str}`;
    },

    formatCurrencyDecimals(value, decimals = 2) {
      const num = Number(value);
      if (isNaN(num)) return "$0.00";
      const fixed = num.toFixed(decimals);
      const [intPart, decPart] = fixed.split(".");
      const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return decPart ? `$${intFormatted}.${decPart}` : `$${intFormatted}`;
    },

    formatVisitors(value) {
      const num = Number(value);
      if (isNaN(num)) return "0";
      if (num >= 1000) {
        const k = num / 1000;
        return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
      }
      return num.toLocaleString("es-CO");
    },

    rankLabel(item, index) {
      const start = this.currentPage * this.pageSize;
      const num = start + index + 1;
      return String(num).padStart(2, "0") + ".";
    },

    // Chart
    initChart(el) {
      if (!el || this._chartInstance) return;
      const w = el.clientWidth || el.offsetWidth;
      const h = el.clientHeight || el.offsetHeight || 300;
      const chartWidth = w;
      const chartHeight = h;
      const options = {
        series: [{ name: "Acumulado", data: [] }],
        chart: {
          type: "area",
          width: chartWidth,
          height: chartHeight,
          fontFamily: "'Geist Mono', monospace",
          background: "transparent",
          toolbar: { show: false },
          animations: { enabled: true, easing: "easeinout", speed: 800 },
          sparkline: { enabled: false },
          selection: { enabled: false },
          zoom: { enabled: false },
        },
        colors: ["#00F0C0"],
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.4,
            opacityTo: 0.1,
            stops: [0, 100],
          },
        },
        stroke: { curve: "smooth", width: 2 },
        dataLabels: {
          enabled: true,
          formatter: (v) => {
            const n = Number(v);
            if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
            if (n >= 1000) return (n / 1000).toFixed(0) + "k";
            return String(n);
          },
          style: { colors: ["#fff"], fontSize: "0.75rem" },
          background: { enabled: true, foreColor: "#000" },
          borderRadius: 4,
          padding: 6,
          offsetY: -12,
        },
        xaxis: {
          categories: [],
          labels: {
            style: { colors: "#94a3b8", fontSize: "0.9rem" },
            formatter: (v) => v,
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          labels: {
            style: { colors: "#94a3b8", fontSize: "0.8rem" },
            formatter: (v) => {
              if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
              if (v >= 1000) return (v / 1000).toFixed(0) + "k";
              return v;
            },
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        grid: {
          borderColor: "#333",
          strokeDashArray: 4,
          xaxis: { lines: { show: false } },
          yaxis: { lines: { show: true } },
          padding: { left: 0, right: 16, top: 8, bottom: 8 },
        },
        tooltip: { enabled: false },
      };
      this._chartInstance = new ApexCharts(el, options);
      this._chartInstance.render();
    },

    updateChart(data) {
      if (!this._chartInstance || !data.series || !data.series[1]) return;
      const labels = data.labels || [];
      const accumulated = data.series[1].data;
      const maxPoints = 6;
      const startIdx = Math.max(0, labels.length - maxPoints);
      const sliceLabels = labels.slice(startIdx);
      const sliceData = accumulated.slice(startIdx);
      this.investmentTotal = accumulated.length
        ? accumulated[accumulated.length - 1]
        : 0;
      this._chartInstance.updateOptions({
        xaxis: { categories: sliceLabels },
        series: [{ name: "Acumulado", data: sliceData }],
      });
    },

    // Rotación
    nextPage() {
      this.currentPage =
        this.currentPage + 1 >= this.totalPages ? 0 : this.currentPage + 1;
      this.progress = 0;
      this._rankingInitialized = true;
    },

    startRotation() {
      if (this._progressInterval) clearInterval(this._progressInterval);
      if (this._rotationInterval) clearInterval(this._rotationInterval);

      const updateInterval = 100;
      const totalSteps = this.rotationInterval / updateInterval;
      const stepSize = 100 / totalSteps;

      this._progressInterval = setInterval(() => {
        this.progress += stepSize;
        if (this.progress > 100) this.progress = 100;
      }, updateInterval);

      this._rotationInterval = setInterval(() => {
        this.nextPage();
      }, this.rotationInterval);
    },

    // Data
    async fetchData() {
      try {
        // Demo: usa mock local que aumenta (1→2→3); producción: fetch a la API real tener en cuenta que se actualiza cada 60 segundos, poner demo en false y cambiar la url de /api/dashboard a la url de la API real
        const demo = true;
        const API_URL =
          typeof window !== "undefined" && window.API_URL
            ? window.API_URL
            : "/api/dashboard";
        const url = demo
          ? `mock-data-${(this._demoIndex++ % 3) + 1}.json`
          : API_URL;
        const response = await fetch(url);
        const data = await response.json();

        if (data.visitors !== undefined) this.visitors = data.visitors;

        if (
          data.investment_chart &&
          JSON.stringify(data.investment_chart) !==
            JSON.stringify(this.investment)
        ) {
          this.investment = data.investment_chart;
          this.updateChart(this.investment);
        }

        this.ranking = data.ranking || [];

        this.lastUpdate = new Date();
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    },

    init() {
      const params = new URLSearchParams(window.location.search);
      const aspect = params.get("aspect");
      if (aspect) this.aspectRatio = aspect;
      this.fetchData().then(() => {
        this.startRotation();
      });
      setInterval(() => this.fetchData(), 60000);
    },
  });
});
