import { useEffect, useMemo, useState } from "react";

const API_URL = "https://copaston-backend.onrender.com";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const [products, setProducts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [maintenance, setMaintenance] = useState([]);

  const [loading, setLoading] = useState(true);

  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddIncident, setShowAddIncident] = useState(false);

  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [theme, setTheme] = useState("light");

  const [editingIncidentId, setEditingIncidentId] = useState(null);

  const [productForm, setProductForm] = useState({
    product_name: "",
    product_type: "",
    manufacturer: "",
    serial_number: "",
    manufacturing_date: "",
    status: "active",
  });

  const [incidentForm, setIncidentForm] = useState({
    product_id: "",
    incident_type: "",
    severity: "Medium",
    description: "",
    status: "open",
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.fontFamily =
      "Inter, Arial, Helvetica, sans-serif";
    document.body.style.background =
      theme === "dark" ? "#0b1220" : "#f5f7fb";
    document.body.style.color =
      theme === "dark" ? "#f8fafc" : "#172033";

    return () => {
      document.body.style.margin = "";
      document.body.style.fontFamily = "";
      document.body.style.background = "";
      document.body.style.color = "";
    };
  }, [theme]);

  async function loadDashboardData() {
    try {
      setLoading(true);

      const [
        productsResponse,
        incidentsResponse,
        maintenanceResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/products/`),
        fetch(`${API_URL}/safety/`),
        fetch(`${API_URL}/maintenance/`),
      ]);

      if (!productsResponse.ok) {
        throw new Error("Unable to load products");
      }

      if (!incidentsResponse.ok) {
        throw new Error("Unable to load safety incidents");
      }

      if (!maintenanceResponse.ok) {
        throw new Error("Unable to load maintenance records");
      }

      const productsData = await productsResponse.json();
      const incidentsData = await incidentsResponse.json();
      const maintenanceData =
        await maintenanceResponse.json();

      setProducts(
        Array.isArray(productsData) ? productsData : []
      );

      setIncidents(
        Array.isArray(incidentsData) ? incidentsData : []
      );

      setMaintenance(
        Array.isArray(maintenanceData)
          ? maintenanceData
          : []
      );
    } catch (error) {
      console.error("Dashboard data error:", error);
    } finally {
      setLoading(false);
    }
  }

  function changePage(page) {
    setActivePage(page);
    setShowProfilePanel(false);
    setShowNotifications(false);
  }

  function openIncidentModal() {
    setShowProfilePanel(false);
    setShowNotifications(false);

    setIncidentForm({
      product_id: "",
      incident_type: "",
      severity: "Medium",
      description: "",
      status: "open",
    });

    setShowAddIncident(true);
  }

  function closeIncidentModal() {
    setShowAddIncident(false);

    setIncidentForm({
      product_id: "",
      incident_type: "",
      severity: "Medium",
      description: "",
      status: "open",
    });
  }

  const openIncidents = useMemo(() => {
    return incidents.filter(
      (item) =>
        String(item.status || "").toLowerCase() ===
        "open"
    );
  }, [incidents]);

  const pendingMaintenance = useMemo(() => {
    return maintenance.filter(
      (item) =>
        String(item.status || "").toLowerCase() ===
        "pending"
    );
  }, [maintenance]);

  const highSeverityIncidents = useMemo(() => {
    return incidents.filter(
      (item) =>
        String(item.severity || "").toLowerCase() ===
        "high"
    );
  }, [incidents]);

  async function askAI() {
    if (!aiQuestion.trim()) return;

    try {
      setAiLoading(true);
      setAiAnswer("");

      const response = await fetch(
        `${API_URL}/agent/orchestrator/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            request: aiQuestion,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "AI request failed"
        );
      }

function formatAIResponse(responseData) {
  const result =
    responseData?.result || responseData;

  if (!result) {
    return "No answer received from COPASTON AI.";
  }

  // RAG answer
  if (result?.answer) {
    return result.answer;
  }

  // Nested RAG answer
  if (result?.result?.answer) {
    return result.result.answer;
  }

  // Direct message
  if (result?.message) {
    return result.message;
  }

  // Get actual agent result
  const agentResult =
    result?.result || result;

  // Product list
  if (Array.isArray(agentResult.products)) {
    if (agentResult.products.length === 0) {
      return "There are currently no products available.";
    }

    return (
      `I found ${agentResult.products.length} product${agentResult.products.length > 1 ? "s" : ""} in COPASTON:\n\n` +
      agentResult.products
        .map(
          (product, index) =>
            `${index + 1}. ${product.product_name || "Unknown product"} — Serial Number: ${product.serial_number || "N/A"}, Status: ${product.status || "N/A"}`
        )
        .join("\n")
    );
  }

  // Safety incident list
  if (Array.isArray(agentResult.incidents)) {
    if (agentResult.incidents.length === 0) {
      return "There are currently no safety incidents.";
    }

    return (
      `I found ${agentResult.incidents.length} safety incident${agentResult.incidents.length > 1 ? "s" : ""}:\n\n` +
      agentResult.incidents
        .map(
          (incident, index) =>
            `${index + 1}. ${incident.incident_type || "Safety incident"} — Severity: ${incident.severity || "N/A"}, Status: ${incident.status || "N/A"}`
        )
        .join("\n")
    );
  }

  // Maintenance record list
  if (Array.isArray(agentResult.records)) {
    if (agentResult.records.length === 0) {
      return "There are currently no maintenance records.";
    }

    return (
      `I found ${agentResult.records.length} maintenance record${agentResult.records.length > 1 ? "s" : ""}:\n\n` +
      agentResult.records
        .map(
          (record, index) =>
            `${index + 1}. ${record.maintenance_type || "Maintenance"} — Due: ${record.due_date || "N/A"}, Status: ${record.status || "N/A"}`
        )
        .join("\n")
    );
  }

  // Maintenance analysis
  if (
    agentResult.recommendation &&
    agentResult.maintenance_id
  ) {
    return (
      `Maintenance Record ${agentResult.maintenance_id}\n\n` +
      `Type: ${agentResult.maintenance_type || "N/A"}\n` +
      `Due Date: ${agentResult.due_date || "N/A"}\n` +
      `Status: ${agentResult.status || "N/A"}\n\n` +
      `Recommendation: ${agentResult.recommendation}`
    );
  }

  // Safety incident analysis
  if (
    agentResult.recommendation &&
    agentResult.incident_id
  ) {
    return (
      `Safety Incident ${agentResult.incident_id}\n\n` +
      `Incident: ${agentResult.incident_type || "N/A"}\n` +
      `Severity: ${agentResult.severity || "N/A"}\n` +
      `Status: ${agentResult.status || "N/A"}\n\n` +
      `Recommendation: ${agentResult.recommendation}`
    );
  }

  // Product analysis
  if (
    agentResult.recommendation &&
    agentResult.product_id
  ) {
    return (
      `Product Analysis — Product ${agentResult.product_id}\n\n` +
      `Product: ${agentResult.product_name || "N/A"}\n` +
      `Serial Number: ${agentResult.serial_number || "N/A"}\n` +
      `Type: ${agentResult.product_type || "N/A"}\n` +
      `Manufacturer: ${agentResult.manufacturer || "N/A"}\n` +
      `Status: ${agentResult.status || "N/A"}\n\n` +
      `Recommendation: ${agentResult.recommendation}`
    );
  }

  // Generic recommendation
  if (agentResult.recommendation) {
    return agentResult.recommendation;
  }

  // Single product
  if (
    agentResult.product_name ||
    agentResult.serial_number
  ) {
    return (
      `Product: ${agentResult.product_name || "N/A"}\n` +
      `Serial Number: ${agentResult.serial_number || "N/A"}\n` +
      `Type: ${agentResult.product_type || "N/A"}\n` +
      `Manufacturer: ${agentResult.manufacturer || "N/A"}\n` +
      `Status: ${agentResult.status || "N/A"}`
    );
  }

  return "COPASTON AI completed the request successfully.";
}

      const answer = formatAIResponse(data);

      setAiAnswer(answer);
    } catch (error) {
      console.error(
        "COPASTON Orchestrator error:",
        error
      );

      setAiAnswer(
        "Unable to connect with the COPASTON AI Orchestrator. Please check that the FastAPI backend and Ollama are running."
      );
    } finally {
      setAiLoading(false);
    }
  }

  async function addProduct(event) {
    event.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/products/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to add product"
        );
      }

      setProducts((prev) => [...prev, data]);

      setProductForm({
        product_name: "",
        product_type: "",
        manufacturer: "",
        serial_number: "",
        manufacturing_date: "",
        status: "active",
      });

      setShowAddProduct(false);
    } catch (error) {
      console.error("Add product error:", error);
      alert(error.message);
    }
  }

  async function addIncident(event) {
    event.preventDefault();

    if (!incidentForm.product_id) {
      alert("Please select a product.");
      return;
    }

    if (!incidentForm.incident_type.trim()) {
      alert("Please enter the incident type.");
      return;
    }

    try {
      const payload = {
        product_id: Number(incidentForm.product_id),
        incident_type:
          incidentForm.incident_type.trim(),
        severity: incidentForm.severity,
        description:
          incidentForm.description.trim(),
        status: incidentForm.status,
      };

      console.log(
        "Submitting safety incident:",
        payload
      );

      const response = await fetch(
        `${API_URL}/safety/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.detail ||
            `Failed to add safety incident. Server returned ${response.status}.`
        );
      }

      console.log(
        "Safety incident created successfully:",
        data
      );

      setIncidents((prev) => [...prev, data]);

      closeIncidentModal();

      alert(
        "Safety incident reported successfully."
      );
    } catch (error) {
      console.error(
        "Add safety incident error:",
        error
      );

      alert(
        error.message ||
          "Unable to report safety incident."
      );
    }
  }

  async function closeIncident(incidentId) {
    try {
      const currentIncident = incidents.find(
        (item) => item.id === incidentId
      );

      if (!currentIncident) return;

      const response = await fetch(
        `${API_URL}/safety/${incidentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...currentIncident,
            status: "closed",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to close incident"
        );
      }

      setIncidents((prev) =>
        prev.map((item) =>
          item.id === incidentId ? data : item
        )
      );
    } catch (error) {
      alert(error.message);
    }
  }

  function productName(productId) {
    const product = products.find(
      (item) => item.id === productId
    );

    return product
      ? product.product_name
      : `Product #${productId}`;
  }

  function formatDate(dateValue) {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function statusBadge(status) {
    const value = String(
      status || "unknown"
    ).toLowerCase();

    let background = "#eef2f7";
    let color = "#475569";

    if (value === "open") {
      background = "#fee2e2";
      color = "#b91c1c";
    }

    if (
      value === "closed" ||
      value === "active"
    ) {
      background = "#dcfce7";
      color = "#15803d";
    }

    if (value === "pending") {
      background = "#fef3c7";
      color = "#b45309";
    }

    return (
      <span
        style={{
          ...styles.badge,
          background,
          color,
        }}
      >
        {String(status || "Unknown")}
      </span>
    );
  }

  function severityBadge(severity) {
    const value = String(
      severity || ""
    ).toLowerCase();

    let background = "#eef2ff";
    let color = "#4338ca";

    if (value === "high") {
      background = "#fee2e2";
      color = "#b91c1c";
    }

    if (value === "medium") {
      background = "#fef3c7";
      color = "#b45309";
    }

    if (value === "low") {
      background = "#dcfce7";
      color = "#15803d";
    }

    return (
      <span
        style={{
          ...styles.badge,
          background,
          color,
        }}
      >
        {severity}
      </span>
    );
  }

  function Sidebar() {
    const navItems = [
      ["dashboard", "◈", "Dashboard"],
      ["products", "▣", "Products"],
      ["safety", "⚠", "Safety Management"],
      ["maintenance", "⚙", "Maintenance"],
      ["ai", "✦", "AI Assistant"],
    ];

    return (
      <aside style={styles.sidebar}>
        <div style={styles.brandArea}>
          <div style={styles.logoBox}>C</div>

          <div>
            <div style={styles.brandName}>
              COPASTON
            </div>

            <div style={styles.brandSubtitle}>
              PRODUCT LIFECYCLE PLATFORM
            </div>
          </div>
        </div>

        <div style={styles.navSectionTitle}>
          MAIN MENU
        </div>

        <div style={styles.navContainer}>
          {navItems.map(
            ([page, icon, label]) => (
              <button
                key={page}
                type="button"
                onClick={() => changePage(page)}
                style={{
                  ...styles.navItem,
                  ...(activePage === page
                    ? styles.navItemActive
                    : {}),
                }}
              >
                <span style={styles.navIcon}>
                  {icon}
                </span>

                <span>{label}</span>
              </button>
            )
          )}
        </div>

        <div style={styles.navSectionTitle}>
          SYSTEM
        </div>

        <button
          type="button"
          onClick={() => changePage("admin")}
          style={{
            ...styles.navItem,
            ...(activePage === "admin"
              ? styles.navItemActive
              : {}),
          }}
        >
          <span style={styles.navIcon}>
            ◉
          </span>

          <span>Administration</span>
        </button>

        <div style={{ flex: 1 }} />

        <button
          type="button"
          onClick={() => changePage("admin")}
          style={{
            ...styles.sidebarStatus,
            background:
              theme === "dark"
                ? "#111c2e"
                : "#f8fafc",
            border:
              theme === "dark"
                ? "1px solid #26344a"
                : "1px solid #e2e8f0",
          }}
        >
          <div style={styles.statusTitle}>
            SYSTEM STATUS
          </div>

          <div style={styles.systemStatusRow}>
            <span style={styles.onlineDot} />

            <span>
              All systems operational
            </span>
          </div>

          <div style={styles.systemStack}>
            FastAPI • PostgreSQL • RAG
          </div>

            <div style={styles.statusClickText}>
              Click to open Administration →
            </div>
          </button>
        </aside>
      );
    }

    function Topbar() {
      return (
        <header
          style={{
            ...styles.topbar,
            background:
              theme === "dark"
                ? "#111827"
                : "#ffffff",
            borderBottom:
              theme === "dark"
                ? "1px solid #263244"
                : "1px solid #e5e7eb",
          }}
        >
          <div>
            <div style={styles.pageSmallTitle}>
              PRODUCT LIFECYCLE
            </div>

            <div style={styles.pageTitle}>
              {getPageTitle(activePage)}
            </div>
          </div>

          <div style={styles.topbarRight}>
            <div
              style={{
                ...styles.apiIndicator,
                background:
                  theme === "dark"
                    ? "#12251b"
                    : "#f0fdf4",
                color:
                  theme === "dark"
                    ? "#86efac"
                    : "#15803d",
              }}
            >
              <span style={styles.onlineDot} />

              API Online
            </div>

            <button
              type="button"
              style={styles.iconButton}
              onClick={() =>
                setShowNotifications(
                  (prev) => !prev
                )
              }
              title="Notifications"
            >
              ♢

              {openIncidents.length > 0 && (
                <span
                  style={styles.notificationCount}
                >
                  {openIncidents.length}
                </span>
              )}
          </button>

          <button
            type="button"
            style={styles.profileButton}
            onClick={() => {
              setShowProfilePanel(
                (prev) => !prev
              );

              setShowNotifications(false);
            }}
          >
            <span style={styles.adminAvatar}>
              A
            </span>

            <span>Admin</span>

            <span>▾</span>
          </button>
        </div>

        {showProfilePanel && (
          <ProfilePanel
            theme={theme}
            setTheme={setTheme}
            changePage={changePage}
          />
        )}

        {showNotifications && (
          <NotificationPanel
            incidents={openIncidents}
            changePage={changePage}
          />
        )}
      </header>
    );
  }

  function ProfilePanel({
    theme,
    setTheme,
    changePage,
  }) {
    return (
      <div style={styles.floatingPanel}>
        <div style={styles.panelHeader}>
          <div style={styles.largeAvatar}>
            A
          </div>

          <div>
            <div style={styles.panelName}>
              Administrator
            </div>

            <div style={styles.panelRole}>
              COPASTON System Admin
            </div>
          </div>
        </div>

        <div style={styles.panelDivider} />

        <button
          type="button"
          style={styles.panelItem}
          onClick={() => changePage("admin")}
        >
          <span>◉</span>
          System Administration
        </button>

        <button
          type="button"
          style={styles.panelItem}
          onClick={() => setTheme("light")}
        >
          <span>☀</span>
          Light Theme
        </button>

        <button
          type="button"
          style={styles.panelItem}
          onClick={() => setTheme("dark")}
        >
          <span>◐</span>
          Dark Theme
        </button>

        <div style={styles.themeInfo}>
          Current theme: {theme}
        </div>
      </div>
    );
  }

  function NotificationPanel({
    incidents,
    changePage,
  }) {
    return (
      <div style={styles.notificationPanel}>
        <div style={styles.notificationHeader}>
          Notifications
        </div>

        {incidents.length === 0 ? (
          <div style={styles.emptyNotification}>
            No open safety incidents.
          </div>
        ) : (
          incidents
            .slice(0, 5)
            .map((incident) => (
              <button
                key={incident.id}
                type="button"
                style={
                  styles.notificationItem
                }
                onClick={() =>
                  changePage("safety")
                }
              >
                <div
                  style={
                    styles.notificationDot
                  }
                />

                <div>
                  <div
                    style={
                      styles.notificationTitle
                    }
                  >
                    {incident.incident_type}
                  </div>

                  <div
                    style={
                      styles.notificationText
                    }
                  >
                    {incident.description ||
                      "Safety incident requires attention."}
                  </div>
                </div>
              </button>
            ))
        )}
      </div>
    );
  }

  function DashboardPage() {
    return (
      <>
        <div style={styles.welcomeRow}>
          <div>
            <h1 style={styles.heading}>
              Operations Overview
            </h1>

            <p style={styles.subHeading}>
              Monitor product lifecycle safety and
              maintenance operations.
            </p>
          </div>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={() =>
              setShowAddProduct(true)
            }
          >
            + Add Product
          </button>
        </div>

        <div style={styles.statsGrid}>
          <StatCard
            title="Total Products"
            value={products.length}
            subtitle="Registered assets"
            icon="▣"
          />

          <StatCard
            title="Open Safety Incidents"
            value={openIncidents.length}
            subtitle={
              openIncidents.length === 0
                ? "No active incidents"
                : "Requires attention"
            }
            icon="⚠"
            danger={
              openIncidents.length > 0
            }
          />

          <StatCard
            title="Pending Maintenance"
            value={
              pendingMaintenance.length
            }
            subtitle="Scheduled activities"
            icon="⚙"
          />

          <StatCard
            title="High Severity"
            value={
              highSeverityIncidents.length
            }
            subtitle="Safety priority"
            icon="!"
            danger={
              highSeverityIncidents.length > 0
            }
          />
        </div>

        <div style={styles.dashboardGrid}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.cardTitle}>
                  Safety Overview
                </div>

                <div style={styles.cardSubtitle}>
                  Current safety incident status
                </div>
              </div>

              <button
                type="button"
                style={styles.textButton}
                onClick={() =>
                  changePage("safety")
                }
              >
                View all →
              </button>
            </div>

            {incidents.length === 0 ? (
              <EmptyState
                icon="✓"
                title="No safety incidents"
                text="Everything is operating normally."
              />
            ) : (
              <div>
                {incidents
                  .slice(0, 5)
                  .map((incident) => (
                    <div
                      key={incident.id}
                      style={styles.listRow}
                    >
                      <div
                        style={
                          styles.listIcon
                        }
                      >
                        ⚠
                      </div>

                      <div
                        style={{ flex: 1 }}
                      >
                        <div
                          style={
                            styles.listTitle
                          }
                        >
                          {
                            incident.incident_type
                          }
                        </div>

                        <div
                          style={
                            styles.listMeta
                          }
                        >
                          {productName(
                            incident.product_id
                          )}
                        </div>
                      </div>

                      {severityBadge(
                        incident.severity
                      )}

                      {statusBadge(
                        incident.status
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.cardTitle}>
                  Maintenance Schedule
                </div>

                <div style={styles.cardSubtitle}>
                  Upcoming maintenance activities
                </div>
              </div>

              <button
                type="button"
                style={styles.textButton}
                onClick={() =>
                  changePage("maintenance")
                }
              >
                View all →
              </button>
            </div>

            {maintenance.length === 0 ? (
              <EmptyState
                icon="✓"
                title="No maintenance records"
                text="No scheduled activities found."
              />
            ) : (
              maintenance
                .slice(0, 5)
                .map((item) => (
                  <div
                    key={item.id}
                    style={styles.listRow}
                  >
                    <div
                      style={styles.listIcon}
                    >
                      ⚙
                    </div>

                    <div
                      style={{ flex: 1 }}
                    >
                      <div
                        style={
                          styles.listTitle
                        }
                      >
                        {
                          item.maintenance_type
                        }
                      </div>

                      <div
                        style={
                          styles.listMeta
                        }
                      >
                        {productName(
                          item.product_id
                        )}
                      </div>
                    </div>

                    <div
                      style={styles.dateText}
                    >
                      {formatDate(
                        item.due_date
                      )}
                    </div>

                    {statusBadge(
                      item.status
                    )}
                  </div>
                ))
            )}
          </div>
        </div>

        <div style={styles.aiDashboardCard}>
          <div>
            <div style={styles.aiSmallTitle}>
              COPASTON INTELLIGENCE
            </div>

            <div style={styles.aiTitle}>
              Need help with a maintenance or safety
              issue?
            </div>

            <div style={styles.aiDescription}>
              Ask the COPASTON AI Assistant using the
              railway maintenance knowledge base.
            </div>
          </div>

          <button
            type="button"
            style={styles.aiButton}
            onClick={() => changePage("ai")}
          >
            Open AI Assistant ✦
          </button>
        </div>
      </>
    );
  }

  function ProductsPage() {
    return (
      <>
        <div style={styles.welcomeRow}>
          <div>
            <h1 style={styles.heading}>
              Products
            </h1>

            <p style={styles.subHeading}>
              Manage registered products and lifecycle
              assets.
            </p>
          </div>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={() =>
              setShowAddProduct(true)
            }
          >
            + Add Product
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                Product Registry
              </div>

              <div style={styles.cardSubtitle}>
                {products.length} registered
                product(s)
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <EmptyState
              icon="▣"
              title="No products found"
              text="Add your first product to start lifecycle tracking."
            />
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>
                      Product
                    </th>

                    <th style={styles.th}>
                      Type
                    </th>

                    <th style={styles.th}>
                      Manufacturer
                    </th>

                    <th style={styles.th}>
                      Serial Number
                    </th>

                    <th style={styles.th}>
                      Manufacturing Date
                    </th>

                    <th style={styles.th}>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map(
                    (product) => (
                      <tr key={product.id}>
                        <td style={styles.td}>
                          <strong>
                            {
                              product.product_name
                            }
                          </strong>
                        </td>

                        <td style={styles.td}>
                          {
                            product.product_type
                          }
                        </td>

                        <td style={styles.td}>
                          {
                            product.manufacturer ||
                            "—"
                          }
                        </td>

                        <td style={styles.td}>
                          {
                            product.serial_number
                          }
                        </td>

                        <td style={styles.td}>
                          {formatDate(
                            product.manufacturing_date
                          )}
                        </td>

                        <td style={styles.td}>
                          {statusBadge(
                            product.status
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  }

  function SafetyPage() {
    return (
      <>
        <div style={styles.welcomeRow}>
          <div>
            <h1 style={styles.heading}>
              Safety Management
            </h1>

            <p style={styles.subHeading}>
              Track, review and resolve product safety
              incidents.
            </p>
          </div>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={openIncidentModal}
          >
            + Report Incident
          </button>
        </div>

        <div style={styles.statsGrid}>
          <StatCard
            title="Total Incidents"
            value={incidents.length}
            subtitle="Recorded incidents"
            icon="⚠"
          />

          <StatCard
            title="Open"
            value={openIncidents.length}
            subtitle="Needs attention"
            icon="!"
            danger={
              openIncidents.length > 0
            }
          />

          <StatCard
            title="High Severity"
            value={
              highSeverityIncidents.length
            }
            subtitle="Priority incidents"
            icon="▲"
            danger={
              highSeverityIncidents.length > 0
            }
          />

          <StatCard
            title="Closed"
            value={
              incidents.filter(
                (item) =>
                  String(
                    item.status
                  ).toLowerCase() ===
                  "closed"
              ).length
            }
            subtitle="Resolved incidents"
            icon="✓"
          />
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                Safety Incident Register
              </div>

              <div style={styles.cardSubtitle}>
                Complete incident history
              </div>
            </div>
          </div>

          {incidents.length === 0 ? (
            <EmptyState
              icon="✓"
              title="No safety incidents"
              text="All systems are currently operating normally."
            />
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>
                      Incident
                    </th>

                    <th style={styles.th}>
                      Product
                    </th>

                    <th style={styles.th}>
                      Severity
                    </th>

                    <th style={styles.th}>
                      Description
                    </th>

                    <th style={styles.th}>
                      Status
                    </th>

                    <th style={styles.th}>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {incidents.map(
                    (incident) => (
                      <tr key={incident.id}>
                        <td style={styles.td}>
                          <strong>
                            {
                              incident.incident_type
                            }
                          </strong>
                        </td>

                        <td style={styles.td}>
                          {productName(
                            incident.product_id
                          )}
                        </td>

                        <td style={styles.td}>
                          {severityBadge(
                            incident.severity
                          )}
                        </td>

                        <td style={styles.td}>
                          {
                            incident.description ||
                            "—"
                          }
                        </td>

                        <td style={styles.td}>
                          {statusBadge(
                            incident.status
                          )}
                        </td>

                        <td style={styles.td}>
                          {String(
                            incident.status ||
                              ""
                          ).toLowerCase() ===
                          "open" ? (
                            <button
                              type="button"
                              style={
                                styles.smallButton
                              }
                              onClick={() =>
                                closeIncident(
                                  incident.id
                                )
                              }
                            >
                              Close
                            </button>
                          ) : (
                            <span
                              style={
                                styles.resolvedText
                              }
                            >
                              Resolved
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  }

  function MaintenancePage() {
    return (
      <>
        <div style={styles.welcomeRow}>
          <div>
            <h1 style={styles.heading}>
              Maintenance Management
            </h1>

            <p style={styles.subHeading}>
              Monitor preventive and corrective
              maintenance activities.
            </p>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <StatCard
            title="Total Records"
            value={maintenance.length}
            subtitle="Maintenance activities"
            icon="⚙"
          />

          <StatCard
            title="Pending"
            value={
              pendingMaintenance.length
            }
            subtitle="Awaiting completion"
            icon="◷"
          />

          <StatCard
            title="Completed"
            value={
              maintenance.filter(
                (item) =>
                  String(
                    item.status
                  ).toLowerCase() ===
                  "completed"
              ).length
            }
            subtitle="Completed activities"
            icon="✓"
          />

          <StatCard
            title="Products Covered"
            value={
              new Set(
                maintenance.map(
                  (item) => item.product_id
                )
              ).size
            }
            subtitle="Assets under maintenance"
            icon="▣"
          />
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                Maintenance Schedule
              </div>

              <div style={styles.cardSubtitle}>
                Product maintenance history
              </div>
            </div>
          </div>

          {maintenance.length === 0 ? (
            <EmptyState
              icon="⚙"
              title="No maintenance records"
              text="No maintenance activities have been registered."
            />
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>
                      Product
                    </th>

                    <th style={styles.th}>
                      Maintenance Type
                    </th>

                    <th style={styles.th}>
                      Description
                    </th>

                    <th style={styles.th}>
                      Due Date
                    </th>

                    <th style={styles.th}>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {maintenance.map(
                    (item) => (
                      <tr key={item.id}>
                        <td style={styles.td}>
                          {productName(
                            item.product_id
                          )}
                        </td>

                        <td style={styles.td}>
                          <strong>
                            {
                              item.maintenance_type
                            }
                          </strong>
                        </td>

                        <td style={styles.td}>
                          {
                            item.description ||
                            "—"
                          }
                        </td>

                        <td style={styles.td}>
                          {formatDate(
                            item.due_date
                          )}
                        </td>

                        <td style={styles.td}>
                          {statusBadge(
                            item.status
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  }

  function AdminPage() {
    return (
      <>
        <div style={styles.welcomeRow}>
          <div>
            <h1 style={styles.heading}>
              System Administration
            </h1>

            <p style={styles.subHeading}>
              Monitor COPASTON platform services and
              system health.
            </p>
          </div>

          <div style={styles.adminOnlineBadge}>
            <span style={styles.onlineDot} />
            System Online
          </div>
        </div>

        <div style={styles.adminGrid}>
          <AdminCard
            icon="●"
            title="System Status"
            value="ONLINE"
            description="COPASTON platform is operational"
            positive
          />

          <AdminCard
            icon="⚡"
            title="Backend API"
            value="FastAPI"
            description="API running on port 8001"
            positive
          />

          <AdminCard
            icon="▣"
            title="Database"
            value="PostgreSQL"
            description="Product lifecycle data store"
            positive
          />

          <AdminCard
            icon="✦"
            title="AI / RAG"
            value="ACTIVE"
            description="Knowledge-base assistant available"
            positive
          />
        </div>

        <div style={styles.dashboardGrid}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              Platform Components
            </div>

            <div style={styles.componentList}>
              <ComponentStatus
                name="FastAPI Backend"
                detail="REST API services"
              />

              <ComponentStatus
                name="PostgreSQL Database"
                detail="Lifecycle records"
              />

              <ComponentStatus
                name="ChromaDB"
                detail="Vector knowledge store"
              />

              <ComponentStatus
                name="Sentence Transformers"
                detail="Document embeddings"
              />

              <ComponentStatus
                name="Ollama / Qwen"
                detail="Local AI inference"
              />
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>
              System Operations
            </div>

            <div style={styles.operationList}>
              <button
                type="button"
                style={styles.operationButton}
                onClick={loadDashboardData}
              >
                <span>↻</span>
                Refresh System Data
              </button>

              <button
                type="button"
                style={styles.operationButton}
                onClick={() =>
                  changePage("products")
                }
              >
                <span>▣</span>
                Manage Products
              </button>

              <button
                type="button"
                style={styles.operationButton}
                onClick={() =>
                  changePage("safety")
                }
              >
                <span>⚠</span>
                Manage Safety
              </button>

              <button
                type="button"
                style={styles.operationButton}
                onClick={() =>
                  changePage("maintenance")
                }
              >
                <span>⚙</span>
                Manage Maintenance
              </button>

              <button
                type="button"
                style={styles.operationButton}
                onClick={() =>
                  changePage("ai")
                }
              >
                <span>✦</span>
                Open AI Assistant
              </button>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>
            COPASTON Platform
          </div>

          <p style={styles.adminDescription}>
            COPASTON is an AI-powered Product Lifecycle
            Safety and Operations & Maintenance platform
            designed to connect product information, safety
            incidents, maintenance records and AI-assisted
            knowledge retrieval in a single system.
          </p>

          <div style={styles.systemInfoGrid}>
            <InfoItem
              label="Platform"
              value="COPASTON"
            />

            <InfoItem
              label="Version"
              value="1.0.0"
            />

            <InfoItem
              label="Backend"
              value="FastAPI"
            />

            <InfoItem
              label="Database"
              value="PostgreSQL"
            />

            <InfoItem
              label="AI"
              value="RAG + Ollama"
            />

            <InfoItem
              label="Environment"
              value="Local Development"
            />
          </div>
        </div>
      </>
    );
  }

  function StatCard({
    title,
    value,
    subtitle,
    icon,
    danger,
  }) {
    return (
      <div style={styles.statCard}>
        <div
          style={{
            ...styles.statIcon,
            ...(danger
              ? styles.statIconDanger
              : {}),
          }}
        >
          {icon}
        </div>

        <div style={{ flex: 1 }}>
          <div style={styles.statTitle}>
            {title}
          </div>

          <div style={styles.statValue}>
            {value}
          </div>

          <div
            style={{
              ...styles.statSubtitle,
              color: danger
                ? "#dc2626"
                : "#64748b",
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    );
  }

  function AdminCard({
    icon,
    title,
    value,
    description,
    positive,
  }) {
    return (
      <div style={styles.adminCard}>
        <div style={styles.adminCardIcon}>
          {icon}
        </div>

        <div style={styles.adminCardTitle}>
          {title}
        </div>

        <div
          style={{
            ...styles.adminCardValue,
            color: positive
              ? "#16a34a"
              : "#dc2626",
          }}
        >
          {value}
        </div>

        <div style={styles.adminCardDescription}>
          {description}
        </div>
      </div>
    );
  }

  function ComponentStatus({
    name,
    detail,
  }) {
    return (
      <div style={styles.componentRow}>
        <div style={styles.componentCheck}>
          ✓
        </div>

        <div style={{ flex: 1 }}>
          <div style={styles.componentName}>
            {name}
          </div>

          <div style={styles.componentDetail}>
            {detail}
          </div>
        </div>

        <span style={styles.runningBadge}>
          RUNNING
        </span>
      </div>
    );
  }

  function InfoItem({ label, value }) {
    return (
      <div style={styles.infoItem}>
        <div style={styles.infoLabel}>
          {label}
        </div>

        <div style={styles.infoValue}>
          {value}
        </div>
      </div>
    );
  }

  function EmptyState({
    icon,
    title,
    text,
  }) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>
          {icon}
        </div>

        <div style={styles.emptyTitle}>
          {title}
        </div>

        <div style={styles.emptyText}>
          {text}
        </div>
      </div>
    );
  }

  function getPageTitle(page) {
    const titles = {
      dashboard: "Dashboard",
      products: "Products",
      safety: "Safety Management",
      maintenance: "Maintenance",
      ai: "AI Assistant",
      admin: "Administration",
    };

    return titles[page] || "Dashboard";
  }

  function renderPage() {
    if (loading) {
      return (
        <div style={styles.loadingPage}>
          <div style={styles.loadingSpinner}>
            ◌
          </div>

          <div>
            Loading COPASTON platform...
          </div>
        </div>
      );
    }

    switch (activePage) {
      case "products":
        return <ProductsPage />;

      case "safety":
        return <SafetyPage />;

      case "maintenance":
        return <MaintenancePage />;

      case "ai":
        /*
          IMPORTANT FIX:

          AIAssistantPage was previously defined as a
          component inside App(). Every time aiQuestion
          changed, App re-rendered and AIAssistantPage
          received a new component identity.

          That caused the textarea to lose focus after
          typing.

          The AI page is now rendered directly here so
          the textarea remains stable while typing.
        */
        return (
          <>
            <div style={styles.welcomeRow}>
              <div>
                <h1 style={styles.heading}>
                  AI Assistant
                </h1>

                <p style={styles.subHeading}>
                  Ask questions about railway maintenance
                  and safety procedures.
                </p>
              </div>
            </div>

            <div style={styles.aiMainCard}>
              <div style={styles.aiMainHeader}>
                <div style={styles.aiMainIcon}>
                  ✦
                </div>

                <div>
                  <div style={styles.aiMainTitle}>
                    COPASTON AI Intelligence
                  </div>

                  <div style={styles.aiMainSubtitle}>
                    RAG-powered maintenance and safety
                    assistant
                  </div>
                </div>
              </div>

              <div style={styles.questionArea}>
                <label
                  style={{
                    ...styles.label,
                    ...styles.aiMainCardLabel,
                  }}
                >
                  Ask your question
                </label>

                <textarea
                  value={aiQuestion}
                  onChange={(event) => {
                    setAiQuestion(event.target.value);
                  }}
                  placeholder="Example: What should I do if the brake response is delayed?"
                  style={styles.textarea}
                  rows={5}
                />

                <button
                  type="button"
                  style={{
                    ...styles.primaryButton,
                    opacity: aiLoading ? 0.7 : 1,
                  }}
                  onClick={askAI}
                  disabled={aiLoading}
                >
                  {aiLoading
                    ? "Thinking..."
                    : "Ask COPASTON AI ✦"}
                </button>
              </div>

              {aiAnswer && (
                <div style={styles.answerBox}>
                  <div style={styles.answerHeader}>
                    <span>AI Response</span>

                  </div>

                  <div style={styles.answerText}>
                    {aiAnswer}
                  </div>
                </div>
              )}

              <div style={styles.aiDisclaimer}>
                AI responses are generated using the
                COPASTON knowledge base and should be
                verified against approved engineering
                procedures before operational use.
              </div>
            </div>
          </>
        );

      case "admin":
        return <AdminPage />;

      case "dashboard":
      default:
        return <DashboardPage />;
    }
  }

  return (
    <div
      style={{
        ...styles.app,
        background:
          theme === "dark"
            ? "#0b1220"
            : "#f5f7fb",
      }}
    >
      <Sidebar />

      <div style={styles.mainArea}>
        <Topbar />

        <main style={styles.content}>
          {renderPage()}
        </main>
      </div>

      {showAddProduct && (
        <Modal
          title="Add Product"
          onClose={() =>
            setShowAddProduct(false)
          }
        >
          <form onSubmit={addProduct}>
            <div style={styles.formGrid}>
              <FormInput
                label="Product Name"
                value={
                  productForm.product_name
                }
                onChange={(value) =>
                  setProductForm({
                    ...productForm,
                    product_name: value,
                  })
                }
                required
              />

              <FormInput
                label="Product Type"
                value={
                  productForm.product_type
                }
                onChange={(value) =>
                  setProductForm({
                    ...productForm,
                    product_type: value,
                  })
                }
                required
              />

              <FormInput
                label="Manufacturer"
                value={
                  productForm.manufacturer
                }
                onChange={(value) =>
                  setProductForm({
                    ...productForm,
                    manufacturer: value,
                  })
                }
              />

              <FormInput
                label="Serial Number"
                value={
                  productForm.serial_number
                }
                onChange={(value) =>
                  setProductForm({
                    ...productForm,
                    serial_number: value,
                  })
                }
                required
              />

              <FormInput
                label="Manufacturing Date"
                type="date"
                value={
                  productForm.manufacturing_date
                }
                onChange={(value) =>
                  setProductForm({
                    ...productForm,
                    manufacturing_date: value,
                  })
                }
              />

              <div>
                <label style={styles.label}>
                  Status
                </label>

                <select
                  value={productForm.status}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      status:
                        event.target.value,
                    })
                  }
                  style={styles.input}
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() =>
                  setShowAddProduct(false)
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                style={styles.primaryButton}
              >
                Add Product
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showAddIncident && (
        <Modal
          title="Report Safety Incident"
          onClose={closeIncidentModal}
        >
          <form onSubmit={addIncident}>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>
                  Product
                </label>

                <select
                  value={
                    incidentForm.product_id
                  }
                  onChange={(event) =>
                    setIncidentForm({
                      ...incidentForm,
                      product_id:
                        event.target.value,
                    })
                  }
                  style={styles.input}
                  required
                >
                  <option value="">
                    Select product
                  </option>

                  {products.map(
                    (product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.product_name} —{" "}
                        {product.serial_number}
                      </option>
                    )
                  )}
                </select>

                {products.length === 0 && (
                  <div
                    style={
                      styles.formHelpError
                    }
                  >
                    No products are registered.
                    Please add a product first.
                  </div>
                )}
              </div>

              <FormInput
                label="Incident Type"
                value={
                  incidentForm.incident_type
                }
                onChange={(value) =>
                  setIncidentForm({
                    ...incidentForm,
                    incident_type: value,
                  })
                }
                required
              />

              <div>
                <label style={styles.label}>
                  Severity
                </label>

                <select
                  value={
                    incidentForm.severity
                  }
                  onChange={(event) =>
                    setIncidentForm({
                      ...incidentForm,
                      severity:
                        event.target.value,
                    })
                  }
                  style={styles.input}
                >
                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>
                </select>
              </div>

              <div>
                <label style={styles.label}>
                  Status
                </label>

                <select
                  value={
                    incidentForm.status
                  }
                  onChange={(event) =>
                    setIncidentForm({
                      ...incidentForm,
                      status:
                        event.target.value,
                    })
                  }
                  style={styles.input}
                >
                  <option value="open">
                    Open
                  </option>

                  <option value="closed">
                    Closed
                  </option>
                </select>
              </div>

              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <label style={styles.label}>
                  Description
                </label>

                <textarea
                  value={
                    incidentForm.description
                  }
                  onChange={(event) =>
                    setIncidentForm({
                      ...incidentForm,
                      description:
                        event.target.value,
                    })
                  }
                  style={styles.textareaSmall}
                  rows={4}
                  placeholder="Describe the safety incident..."
                />
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={closeIncidentModal}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={styles.primaryButton}
              >
                Report Incident
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label style={styles.label}>
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={styles.input}
        required={required}
      />
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}) {
  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      style={styles.modalOverlay}
      onMouseDown={handleOverlayClick}
    >
      <div
        style={styles.modal}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>
            {title}
          </div>

          <button
            type="button"
            style={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div style={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    display: "flex",
    transition: "background 0.2s ease",
  },

  sidebar: {
    width: "250px",
    minHeight: "100vh",
    background: "#101827",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    padding: "22px 16px",
    boxSizing: "border-box",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
  },

  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "4px 8px 28px",
  },

  logoBox: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    background: "#ffffff",
    color: "#101827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    fontWeight: 800,
  },

  brandName: {
    fontSize: "19px",
    fontWeight: 800,
    letterSpacing: "0.5px",
  },

  brandSubtitle: {
    fontSize: "8px",
    color: "#94a3b8",
    marginTop: "3px",
    letterSpacing: "0.7px",
  },

  navSectionTitle: {
    fontSize: "10px",
    color: "#64748b",
    fontWeight: 700,
    letterSpacing: "1px",
    padding: "12px 12px 8px",
  },

  navContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  navItem: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    padding: "12px 13px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    fontSize: "14px",
    textAlign: "left",
  },

  navItemActive: {
    background: "#ffffff",
    color: "#101827",
    fontWeight: 700,
  },

  navIcon: {
    width: "20px",
    textAlign: "center",
    fontSize: "16px",
  },

  sidebarStatus: {
    width: "100%",
    borderRadius: "11px",
    padding: "14px",
    color: "#e2e8f0",
    cursor: "pointer",
    textAlign: "left",
    marginTop: "12px",
  },

  statusTitle: {
    fontSize: "9px",
    color: "#64748b",
    fontWeight: 700,
    letterSpacing: "1px",
    marginBottom: "8px",
  },

  systemStatusRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    fontWeight: 600,
  },

  onlineDot: {
    width: "8px",
    height: "8px",
    background: "#22c55e",
    borderRadius: "50%",
    display: "inline-block",
    boxShadow:
      "0 0 0 3px rgba(34,197,94,0.12)",
  },

  systemStack: {
    fontSize: "10px",
    color: "#64748b",
    marginTop: "7px",
  },

  statusClickText: {
    fontSize: "9px",
    color: "#64748b",
    marginTop: "9px",
  },

  mainArea: {
    marginLeft: "250px",
    width: "calc(100% - 250px)",
    minHeight: "100vh",
  },

  topbar: {
    height: "76px",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    boxSizing: "border-box",
  },

  pageSmallTitle: {
    fontSize: "9px",
    color: "#94a3b8",
    letterSpacing: "1.3px",
    fontWeight: 700,
  },

  pageTitle: {
    fontSize: "21px",
    fontWeight: 750,
    marginTop: "3px",
  },

  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  apiIndicator: {
    padding: "8px 12px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "12px",
    fontWeight: 600,
  },

  iconButton: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    cursor: "pointer",
    position: "relative",
    fontSize: "17px",
  },

  notificationCount: {
    position: "absolute",
    right: "-4px",
    top: "-5px",
    background: "#ef4444",
    color: "#ffffff",
    width: "17px",
    height: "17px",
    borderRadius: "50%",
    fontSize: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },

  profileButton: {
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    padding: "6px 10px 6px 7px",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: 600,
    color: "#172033",
  },

  adminAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "#101827",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 700,
  },

  content: {
    padding: "30px 32px 45px",
    maxWidth: "1500px",
    margin: "0 auto",
  },

  welcomeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "25px",
    gap: "20px",
  },

  heading: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 800,
    color: "#172033",
  },

  subHeading: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  primaryButton: {
    border: "none",
    background: "#101827",
    color: "#ffffff",
    padding: "11px 17px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },

  secondaryButton: {
    border: "1px solid #dbe2ea",
    background: "#ffffff",
    color: "#334155",
    padding: "10px 17px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e6eaf0",
    borderRadius: "13px",
    padding: "20px",
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.03)",
  },

  statIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "#f1f5f9",
    color: "#334155",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px",
    fontWeight: 700,
  },

  statIconDanger: {
    background: "#fef2f2",
    color: "#dc2626",
  },

  statTitle: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: 600,
  },

  statValue: {
    fontSize: "28px",
    fontWeight: 800,
    marginTop: "3px",
    color: "#172033",
  },

  statSubtitle: {
    fontSize: "10px",
    marginTop: "2px",
  },

  dashboardGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(420px, 1fr))",
    gap: "18px",
    marginBottom: "18px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e6eaf0",
    borderRadius: "13px",
    padding: "21px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.03)",
    marginBottom: "18px",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "16px",
  },

  cardTitle: {
    fontSize: "15px",
    fontWeight: 750,
    color: "#172033",
  },

  cardSubtitle: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "4px",
  },

  textButton: {
    border: "none",
    background: "transparent",
    color: "#475569",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
  },

  listRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    borderBottom:
      "1px solid #eef2f6",
  },

  listIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#475569",
    fontSize: "14px",
  },

  listTitle: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#334155",
  },

  listMeta: {
    fontSize: "10px",
    color: "#94a3b8",
    marginTop: "3px",
  },

  badge: {
    padding: "5px 8px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: 700,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },

  dateText: {
    fontSize: "10px",
    color: "#64748b",
    whiteSpace: "nowrap",
  },

  aiDashboardCard: {
    background: "#101827",
    color: "#ffffff",
    borderRadius: "14px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },

  aiSmallTitle: {
    fontSize: "9px",
    color: "#94a3b8",
    letterSpacing: "1.3px",
    fontWeight: 700,
  },

  aiTitle: {
    fontSize: "18px",
    fontWeight: 750,
    marginTop: "7px",
  },

  aiDescription: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "6px",
  },

  aiButton: {
    border: "none",
    background: "#ffffff",
    color: "#101827",
    borderRadius: "8px",
    padding: "11px 16px",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "750px",
  },

  th: {
    textAlign: "left",
    padding: "11px 10px",
    fontSize: "10px",
    color: "#64748b",
    fontWeight: 700,
    background: "#f8fafc",
    borderBottom:
      "1px solid #e2e8f0",
  },

  td: {
    padding: "13px 10px",
    fontSize: "11px",
    color: "#475569",
    borderBottom:
      "1px solid #eef2f6",
    verticalAlign: "middle",
  },

  smallButton: {
    border:
      "1px solid #fecaca",
    background: "#fff7f7",
    color: "#dc2626",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: 700,
    cursor: "pointer",
  },

  resolvedText: {
    fontSize: "10px",
    color: "#16a34a",
    fontWeight: 700,
  },

  emptyState: {
    textAlign: "center",
    padding: "45px 20px",
  },

  emptyIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#f0fdf4",
    color: "#16a34a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
    fontSize: "20px",
    fontWeight: 800,
  },

  emptyTitle: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#334155",
  },

  emptyText: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "5px",
  },

  aiMainCard: {
    background: "#101827",
    borderRadius: "15px",
    padding: "28px",
    color: "#ffffff",
  },

  aiMainHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "27px",
  },

  aiMainIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#101827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    fontWeight: 800,
  },

  aiMainTitle: {
    fontSize: "19px",
    fontWeight: 800,
  },

  aiMainSubtitle: {
    color: "#94a3b8",
    fontSize: "11px",
    marginTop: "4px",
  },

  questionArea: {
    background: "#172235",
    borderRadius: "12px",
    padding: "20px",
  },

  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    color: "#475569",
    marginBottom: "7px",
  },

  aiMainCardLabel: {
    color: "#cbd5e1",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    border:
      "1px solid #334155",
    background: "#0f172a",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "13px",
    fontSize: "13px",
    outline: "none",
    marginBottom: "12px",
  },

  answerBox: {
    marginTop: "18px",
    background: "#ffffff",
    color: "#172033",
    borderRadius: "11px",
    padding: "20px",
  },

  answerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 750,
    fontSize: "13px",
    marginBottom: "10px",
  },

  ragBadge: {
    background: "#dcfce7",
    color: "#15803d",
    borderRadius: "20px",
    padding: "5px 8px",
    fontSize: "9px",
    fontWeight: 700,
  },

  answerText: {
    fontSize: "13px",
    lineHeight: 1.7,
    color: "#475569",
  },

  aiDisclaimer: {
    marginTop: "16px",
    color: "#64748b",
    fontSize: "10px",
    lineHeight: 1.5,
  },

  adminOnlineBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 13px",
    borderRadius: "20px",
    background: "#f0fdf4",
    color: "#15803d",
    fontSize: "11px",
    fontWeight: 700,
  },

  adminGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },

  adminCard: {
    background: "#ffffff",
    border: "1px solid #e6eaf0",
    borderRadius: "13px",
    padding: "20px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.03)",
  },

  adminCardIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#334155",
    marginBottom: "13px",
  },

  adminCardTitle: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: 600,
  },

  adminCardValue: {
    fontSize: "20px",
    fontWeight: 800,
    marginTop: "5px",
  },

  adminCardDescription: {
    fontSize: "10px",
    color: "#94a3b8",
    marginTop: "5px",
  },

  componentList: {
    marginTop: "17px",
  },

  componentRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "13px 0",
    borderBottom:
      "1px solid #eef2f6",
  },

  componentCheck: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#15803d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 800,
  },

  componentName: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#334155",
  },

  componentDetail: {
    fontSize: "10px",
    color: "#94a3b8",
    marginTop: "3px",
  },

  runningBadge: {
    fontSize: "8px",
    color: "#15803d",
    background: "#dcfce7",
    borderRadius: "20px",
    padding: "5px 7px",
    fontWeight: 800,
  },

  operationList: {
    marginTop: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  operationButton: {
    width: "100%",
    border:
      "1px solid #e2e8f0",
    background: "#ffffff",
    borderRadius: "8px",
    padding: "12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#334155",
    fontSize: "11px",
    fontWeight: 650,
    cursor: "pointer",
    textAlign: "left",
  },

  adminDescription: {
    color: "#64748b",
    fontSize: "12px",
    lineHeight: 1.7,
    maxWidth: "900px",
  },

  systemInfoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginTop: "20px",
  },

  infoItem: {
    background: "#f8fafc",
    borderRadius: "9px",
    padding: "12px",
  },

  infoLabel: {
    fontSize: "9px",
    color: "#94a3b8",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },

  infoValue: {
    fontSize: "12px",
    color: "#334155",
    fontWeight: 700,
    marginTop: "4px",
  },

  floatingPanel: {
    position: "absolute",
    right: "32px",
    top: "65px",
    width: "270px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    boxShadow:
      "0 15px 35px rgba(15,23,42,0.15)",
    padding: "15px",
    zIndex: 100,
  },

  panelHeader: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  largeAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#101827",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },

  panelName: {
    fontSize: "12px",
    fontWeight: 750,
    color: "#172033",
  },

  panelRole: {
    fontSize: "9px",
    color: "#94a3b8",
    marginTop: "3px",
  },

  panelDivider: {
    height: "1px",
    background: "#eef2f6",
    margin: "13px 0",
  },

  panelItem: {
    width: "100%",
    border: "none",
    background: "#ffffff",
    padding: "10px 5px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "11px",
    color: "#334155",
    cursor: "pointer",
    textAlign: "left",
  },

  themeInfo: {
    fontSize: "9px",
    color: "#94a3b8",
    marginTop: "5px",
    padding: "4px 5px",
  },

  notificationPanel: {
    position: "absolute",
    right: "90px",
    top: "65px",
    width: "320px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    boxShadow:
      "0 15px 35px rgba(15,23,42,0.15)",
    zIndex: 100,
    overflow: "hidden",
  },

  notificationHeader: {
    padding: "15px",
    fontSize: "13px",
    fontWeight: 750,
    borderBottom:
      "1px solid #eef2f6",
  },

  notificationItem: {
    width: "100%",
    border: "none",
    borderBottom:
      "1px solid #eef2f6",
    background: "#ffffff",
    padding: "13px",
    display: "flex",
    gap: "10px",
    textAlign: "left",
    cursor: "pointer",
  },

  notificationDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#ef4444",
    marginTop: "5px",
    flexShrink: 0,
  },

  notificationTitle: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#334155",
  },

  notificationText: {
    fontSize: "9px",
    color: "#94a3b8",
    marginTop: "3px",
    lineHeight: 1.4,
  },

  emptyNotification: {
    padding: "25px 15px",
    textAlign: "center",
    fontSize: "11px",
    color: "#94a3b8",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(15,23,42,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },

  modal: {
    width: "100%",
    maxWidth: "650px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "14px",
    boxShadow:
      "0 25px 60px rgba(15,23,42,0.25)",
  },

  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 20px",
    borderBottom:
      "1px solid #eef2f6",
  },

  modalTitle: {
    fontSize: "17px",
    fontWeight: 800,
    color: "#172033",
  },

  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: "25px",
    color: "#64748b",
    cursor: "pointer",
    lineHeight: 1,
  },

  modalBody: {
    padding: "20px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border:
      "1px solid #dbe2ea",
    background: "#ffffff",
    borderRadius: "8px",
    padding: "10px 11px",
    fontSize: "12px",
    color: "#334155",
    outline: "none",
  },

  textareaSmall: {
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    border:
      "1px solid #dbe2ea",
    background: "#ffffff",
    borderRadius: "8px",
    padding: "10px 11px",
    fontSize: "12px",
    color: "#334155",
    outline: "none",
  },

  formHelpError: {
    fontSize: "10px",
    color: "#dc2626",
    marginTop: "6px",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "22px",
    paddingTop: "16px",
    borderTop:
      "1px solid #eef2f6",
  },

  loadingPage: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    color: "#64748b",
    fontSize: "13px",
  },

  loadingSpinner: {
    fontSize: "30px",
    color: "#101827",
  },
};

export default App;