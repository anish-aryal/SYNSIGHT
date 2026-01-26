import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Input,
  InputGroup,
  InputGroupText,
  Button,
  Badge,
  Table,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Progress,
  FormGroup,
  Label,
} from "reactstrap";
import {
  Search,
  Copy,
  Check,
  Plus,
  Star,
  SlidersHorizontal,
  ArrowUp,
  Database,
  Activity,
  Zap,
  TrendingUp,
} from "lucide-react";

/**
 * Tokens aligned to your updated global CSS:
 * - Brand: --syn-brand-* / --syn-gradient-primary
 * - Neutrals/Text: --syn-bg, --syn-surface*, --syn-text*
 * - Semantics: --syn-success/danger/warning/info + soft variants
 * - Radius/Shadows: --syn-radius-* / --syn-shadow-*
 */
const TOKEN_GROUPS = [
  {
    title: "Brand",
    description: "Primary gradient and brand colors for CTAs.",
    vars: ["--syn-brand-1", "--syn-brand-2", "--syn-brand-3", "--syn-primary", "--syn-gradient-primary"],
  },
  {
    title: "Neutrals & Text",
    description: "Surfaces, borders, and text colors used across pages.",
    vars: ["--syn-bg", "--syn-surface", "--syn-surface-2", "--syn-border", "--syn-divider", "--syn-text", "--syn-text-muted", "--syn-text-faint", "--syn-nav-active-bg"],
  },
  {
    title: "Semantic",
    description: "Status/sentiment colors + soft backgrounds.",
    vars: ["--syn-success", "--syn-danger", "--syn-warning", "--syn-info", "--syn-neutral", "--syn-success-soft", "--syn-danger-soft", "--syn-warning-soft", "--syn-info-soft", "--syn-neutral-soft"],
  },
  {
    title: "Radius & Shadow",
    description: "Radii and elevation used by cards and controls.",
    vars: ["--syn-radius-sm", "--syn-radius-md", "--syn-radius-pill", "--syn-shadow-sm", "--syn-shadow-md", "--syn-focus-ring"],
  },
  {
    title: "Typography",
    description: "Font family, sizes, weights, leading.",
    vars: ["--syn-font-family", "--syn-text-xs", "--syn-text-sm", "--syn-text-md", "--syn-text-lg", "--syn-text-xl", "--syn-fw-regular", "--syn-fw-medium", "--syn-fw-semibold", "--syn-fw-bold", "--syn-leading-tight", "--syn-leading-normal"],
  },
];

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "tokens", label: "Tokens" },
  { id: "typography", label: "Typography" },
  { id: "components", label: "Components" },
  { id: "patterns", label: "Page Patterns" },
  { id: "debug", label: "Debug Table" },
];

function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function useActiveSection(sectionIds) {
  const [active, setActive] = useState(sectionIds[0] || "");
  const observerRef = useRef(null);

  useEffect(() => {
    const els = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { threshold: [0.15, 0.25, 0.35], rootMargin: "-12% 0px -70% 0px" }
    );

    els.forEach((el) => observerRef.current.observe(el));
    return () => observerRef.current?.disconnect();
  }, [sectionIds]);

  return [active, setActive];
}

function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--syn-text)" }}>{title}</div>
      {subtitle ? (
        <div style={{ fontSize: "0.875rem", color: "var(--syn-text-muted)", marginTop: 2 }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

function TokenSwatch({ name, value }) {
  const [copied, setCopied] = useState(false);

  const isGradient = (value || "").includes("linear-gradient");
  const isColor = /^#|^rgb|^rgba|^hsl|^hsla/i.test(value || "");
  const looksLikeShadow = name.includes("shadow");
  const looksLikeRadius = name.includes("radius");

  const swatchStyle = (() => {
    const base = {
      width: 40,
      height: 40,
      borderRadius: 12,
      border: "1px solid var(--syn-border)",
      background: "var(--syn-surface)",
      flex: "0 0 auto",
    };
    if (isGradient) return { ...base, background: value, border: "none" };
    if (isColor) return { ...base, background: value, border: "none" };
    if (looksLikeShadow) return { ...base, boxShadow: value, background: "var(--syn-surface)" };
    if (looksLikeRadius) return { ...base, borderRadius: value || 12 };
    return { ...base, borderStyle: "dashed", background: "transparent" };
  })();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // ignore
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: 10,
        border: "1px solid var(--syn-divider)",
        borderRadius: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div style={swatchStyle} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: "var(--syn-text)" }}>{name}</div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--syn-text-muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 360,
            }}
            title={value || ""}
          >
            {value || "—"}
          </div>
        </div>
      </div>

      <Button
        type="button"
        color="light"
        onClick={handleCopy}
        aria-label={`Copy ${name}`}
        style={{
          width: 40,
          height: 40,
          padding: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </Button>
    </div>
  );
}

function StatCard({ label, value, icon, accentVar }) {
  return (
    <Card>
      <CardBody style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "0.75rem", color: "var(--syn-text-muted)", fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: "1.5rem", lineHeight: 1.2, fontWeight: 700, color: "var(--syn-text)", marginTop: 6 }}>
            {value}
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--syn-surface-2)",
            color: `var(${accentVar})`,
            border: "1px solid var(--syn-border)",
            flex: "0 0 auto",
          }}
        >
          {icon}
        </div>
      </CardBody>
    </Card>
  );
}

export default function DesignSystemPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("buttons");
  const [patternTab, setPatternTab] = useState("dashboard");
  const [activeSection, setActiveSection] = useActiveSection(SECTIONS.map((s) => s.id));
  const [values, setValues] = useState({});
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    const allVars = TOKEN_GROUPS.flatMap((g) => g.vars);
    const next = {};
    allVars.forEach((v) => (next[v] = getCssVar(v)));
    setValues(next);
  }, []);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TOKEN_GROUPS;

    return TOKEN_GROUPS.map((g) => {
      const vars = g.vars.filter(
        (v) => v.toLowerCase().includes(q) || (values[v] || "").toLowerCase().includes(q)
      );
      return { ...g, vars };
    }).filter((g) => g.vars.length > 0);
  }, [search, values]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  };

  const showBackToTop = activeSection !== "overview";

  return (
    <Container fluid style={{ padding: 24 }}>
      <Row style={{ "--bs-gutter-x": "1.5rem", "--bs-gutter-y": "1.5rem" }}>
        {/* LEFT NAV */}
        <Col lg="3">
          <Card style={{ position: "sticky", top: 16 }}>
            <CardBody>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, color: "var(--syn-text)" }}>Design System</div>
                <div style={{ fontSize: "0.875rem", color: "var(--syn-text-muted)" }}>
                  Tokens, components, and page patterns
                </div>
              </div>

              <Nav pills vertical>
                {SECTIONS.map((s) => (
                  <NavItem key={s.id}>
                    <NavLink
                      href="#"
                      active={activeSection === s.id}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollTo(s.id);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {s.label}
                    </NavLink>
                  </NavItem>
                ))}
              </Nav>

              <div style={{ borderTop: "1px solid var(--syn-divider)", margin: "16px 0" }} />

              <div style={{ fontSize: "0.875rem", color: "var(--syn-text-muted)" }}>
                This page should look consistent with Dashboard, Explore, and Projects.
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* MAIN CONTENT */}
        <Col lg="9">
          {/* OVERVIEW */}
          <div id="overview" style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 320px" }}>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: 4 }}>Design System</h1>
              <p style={{ margin: 0, color: "var(--syn-text-muted)" }}>
                Single source of truth for tokens + Reactstrap primitives (no custom classes).
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end" }}>
              <InputGroup style={{ width: 360, maxWidth: "100%" }}>
                <InputGroupText>
                  <Search size={18} />
                </InputGroupText>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tokens (e.g. --syn-border, shadow)…"
                />
              </InputGroup>

              <Button color="secondary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <SlidersHorizontal size={18} />
                Filters
              </Button>

              <Button color="primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Plus size={18} />
                Primary
              </Button>
            </div>
          </div>

          {/* QUICK STATS (match Dashboard KPI feel) */}
          <div style={{ marginTop: 16 }}>
            <Row style={{ "--bs-gutter-x": "1.5rem", "--bs-gutter-y": "1.5rem" }}>
              <Col md="3">
                <StatCard label="Total Tokens" value="28" icon={<Database size={18} />} accentVar="--syn-accent-blue" />
              </Col>
              <Col md="3">
                <StatCard label="Components" value="12" icon={<Zap size={18} />} accentVar="--syn-accent-purple" />
              </Col>
              <Col md="3">
                <StatCard label="Patterns" value="4" icon={<TrendingUp size={18} />} accentVar="--syn-accent-green" />
              </Col>
              <Col md="3">
                <StatCard label="Status" value="Stable" icon={<Activity size={18} />} accentVar="--syn-accent-orange" />
              </Col>
            </Row>
          </div>

          {/* TOKENS */}
          <section id="tokens" style={{ marginTop: 24 }}>
            <SectionTitle title="Tokens" subtitle="Computed CSS variables from :root. Search filters this list." />

            <Row style={{ "--bs-gutter-x": "1.5rem", "--bs-gutter-y": "1.5rem" }}>
              {filteredGroups.map((group) => (
                <Col md="6" key={group.title}>
                  <Card>
                    <CardBody>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--syn-text)" }}>{group.title}</div>
                          <div style={{ fontSize: "0.875rem", color: "var(--syn-text-muted)" }}>{group.description}</div>
                        </div>
                      </div>

                      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                        {group.vars.map((v) => (
                          <TokenSwatch key={v} name={v} value={values[v]} />
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>

          {/* TYPOGRAPHY */}
          <section id="typography" style={{ marginTop: 24 }}>
            <SectionTitle title="Typography" subtitle="Hierarchy that matches the app pages (14px body, 18–24px titles)." />

            <Card>
              <CardBody>
                <Row style={{ "--bs-gutter-x": "1.5rem", "--bs-gutter-y": "1.5rem" }}>
                  <Col md="6">
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.2 }}>Page Title</div>
                      <div style={{ fontSize: "0.875rem", color: "var(--syn-text-muted)" }}>
                        Used for Projects / Dashboard / Explore headings
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.35 }}>Section Title</div>
                      <div style={{ fontSize: "0.875rem", color: "var(--syn-text-muted)" }}>
                        Used inside cards and major blocks
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "1rem", fontWeight: 600, lineHeight: 1.35 }}>Card Title</div>
                      <div style={{ fontSize: "0.875rem", color: "var(--syn-text-muted)" }}>
                        Used for card headers / primary labels
                      </div>
                    </div>
                  </Col>

                  <Col md="6">
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
                        Body — The quick brown fox jumps over the lazy dog.
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "var(--syn-text-muted)" }}>
                        Standard paragraph and UI text
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                        Body Strong — Emphasis and primary labels.
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "var(--syn-text-muted)" }}>
                        Use sparingly
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--syn-text-muted)" }}>
                        Caption — Secondary helper text / metadata
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--syn-text-faint)", marginTop: 6 }}>
                        Caption XS — Timestamps / chart axes
                      </div>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </section>

          {/* COMPONENTS */}
          <section id="components" style={{ marginTop: 24 }}>
            <SectionTitle title="Components" subtitle="Reactstrap primitives styled by global CSS." />

            <Card>
              <CardBody>
                <Nav pills style={{ marginBottom: 16 }}>
                  {[
                    { id: "buttons", label: "Buttons" },
                    { id: "inputs", label: "Inputs" },
                    { id: "badges", label: "Badges" },
                    { id: "progress", label: "Progress" },
                    { id: "switch", label: "Switch" },
                    { id: "table", label: "Table" },
                  ].map((t) => (
                    <NavItem key={t.id}>
                      <NavLink
                        href="#"
                        active={tab === t.id}
                        onClick={(e) => {
                          e.preventDefault();
                          setTab(t.id);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {t.label}
                      </NavLink>
                    </NavItem>
                  ))}
                </Nav>

                <TabContent activeTab={tab}>
                  <TabPane tabId="buttons">
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Buttons</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Button color="primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <Plus size={18} />
                        Primary
                      </Button>

                      <Button color="secondary">Secondary</Button>

                      <Button outline color="primary">Outline Primary</Button>

                      <Button outline color="secondary">Outline (Explore-style)</Button>

                      <Button color="light">Light</Button>

                      <Button color="primary" disabled>Disabled</Button>
                    </div>
                  </TabPane>

                  <TabPane tabId="inputs">
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Search / Input</div>
                    <InputGroup style={{ maxWidth: 520 }}>
                      <InputGroupText>
                        <Search size={18} />
                      </InputGroupText>
                      <Input placeholder="Search…" />
                    </InputGroup>
                    <div style={{ fontSize: "0.875rem", color: "var(--syn-text-muted)", marginTop: 8 }}>
                      Focus to confirm border color + focus ring.
                    </div>
                  </TabPane>

                  <TabPane tabId="badges">
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Badges / Pills</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <Badge pill color="secondary">Marketing</Badge>
                      <Badge pill color="secondary">Research</Badge>
                      <Badge pill color="secondary">Customer Success</Badge>

                      <Badge pill color="success">Active</Badge>
                      <Badge pill color="warning">Rate Limited</Badge>
                      <Badge pill color="danger">Disconnected</Badge>

                      <Badge pill color="success">Positive</Badge>
                      <Badge pill color="secondary">Neutral</Badge>
                      <Badge pill color="danger">Negative</Badge>
                    </div>
                  </TabPane>

                  <TabPane tabId="progress">
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Progress</div>

                    <div style={{ display: "grid", gap: 12, maxWidth: 640 }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>API Usage</div>
                          <div style={{ fontSize: "0.875rem", color: "var(--syn-text-muted)" }}>72%</div>
                        </div>
                        <Progress value={72} className="mt-2" />
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>Rate Limit</div>
                          <div style={{ fontSize: "0.875rem", color: "var(--syn-text-muted)" }}>88%</div>
                        </div>
                        <Progress value={88} className="mt-2">
                          <div className="progress-bar bg-warning" style={{ width: "88%" }} />
                        </Progress>
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>Errors</div>
                          <div style={{ fontSize: "0.875rem", color: "var(--syn-text-muted)" }}>12%</div>
                        </div>
                        <Progress value={12} className="mt-2">
                          <div className="progress-bar bg-danger" style={{ width: "12%" }} />
                        </Progress>
                      </div>
                    </div>
                  </TabPane>

                  <TabPane tabId="switch">
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Switch</div>

                    <FormGroup switch style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Input
                        type="switch"
                        checked={connected}
                        onChange={(e) => setConnected(e.target.checked)}
                      />
                      <Label check style={{ margin: 0, color: "var(--syn-text)" }}>
                        Connected
                      </Label>
                      <div style={{ marginLeft: "auto" }}>
                        <Badge pill color={connected ? "success" : "danger"}>
                          {connected ? "Active" : "Disconnected"}
                        </Badge>
                      </div>
                    </FormGroup>
                  </TabPane>

                  <TabPane tabId="table">
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Table</div>
                    <Table responsive style={{ marginBottom: 0 }}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Status</th>
                          <th>Updated</th>
                          <th style={{ width: 120 }} />
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Brand Monitoring Q4</td>
                          <td><Badge pill color="success">Active</Badge></td>
                          <td style={{ fontSize: "0.875rem", color: "var(--syn-text-muted)" }}>2 hours ago</td>
                          <td>
                            <Button outline color="secondary" size="sm">Analyze</Button>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Competitor Analysis</td>
                          <td><Badge pill color="warning">Rate Limited</Badge></td>
                          <td style={{ fontSize: "0.875rem", color: "var(--syn-text-muted)" }}>1 day ago</td>
                          <td>
                            <Button outline color="secondary" size="sm">Analyze</Button>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </section>

          {/* PAGE PATTERNS */}
          <section id="patterns" style={{ marginTop: 24 }}>
            <SectionTitle title="Page Patterns" subtitle="Quick previews of common page blocks from the product." />

            <Card>
              <CardBody>
                <Nav pills style={{ marginBottom: 16 }}>
                  {[
                    { id: "dashboard", label: "Dashboard" },
                    { id: "explore", label: "Explore" },
                  ].map((t) => (
                    <NavItem key={t.id}>
                      <NavLink
                        href="#"
                        active={patternTab === t.id}
                        onClick={(e) => {
                          e.preventDefault();
                          setPatternTab(t.id);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {t.label}
                      </NavLink>
                    </NavItem>
                  ))}
                </Nav>

                <TabContent activeTab={patternTab}>
                  <TabPane tabId="dashboard">
                    <Row style={{ "--bs-gutter-x": "1.5rem", "--bs-gutter-y": "1.5rem" }}>
                      <Col md="3">
                        <StatCard label="Total Projects" value="4" icon={<Database size={18} />} accentVar="--syn-accent-blue" />
                      </Col>
                      <Col md="3">
                        <StatCard label="Total Queries" value="41" icon={<Activity size={18} />} accentVar="--syn-accent-purple" />
                      </Col>
                      <Col md="3">
                        <StatCard label="Starred" value="2" icon={<Star size={18} />} accentVar="--syn-accent-yellow" />
                      </Col>
                      <Col md="3">
                        <StatCard label="Workspaces" value="4" icon={<Zap size={18} />} accentVar="--syn-accent-green" />
                      </Col>
                    </Row>
                  </TabPane>

                  <TabPane tabId="explore">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                      <div style={{ fontWeight: 600 }}>Trending Topics</div>
                      <Button outline color="secondary" size="sm">View All</Button>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <Card>
                        <CardBody>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                            <div>
                              <div style={{ fontWeight: 600 }}>AI technology</div>
                              <div style={{ fontSize: "0.875rem", color: "var(--syn-text-muted)", marginTop: 2 }}>
                                12.5K posts • last 7 days
                              </div>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                                <Badge pill color="success">62% Positive</Badge>
                                <Badge pill color="secondary">25% Neutral</Badge>
                                <Badge pill color="danger">13% Negative</Badge>
                              </div>
                            </div>
                            <Button outline color="secondary" size="sm">Analyze</Button>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  </TabPane>

                </TabContent>
              </CardBody>
            </Card>
          </section>

          {/* DEBUG */}
          <section id="debug" style={{ marginTop: 24 }}>
            <SectionTitle title="Debug Table" subtitle="Computed token values from the loaded CSS." />

            <Card>
              <CardBody>
                <Table responsive style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Variable</th>
                      <th>Computed value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TOKEN_GROUPS.flatMap((g) => g.vars).map((v) => (
                      <tr key={v}>
                        <td style={{ fontWeight: 600 }}>{v}</td>
                        <td style={{ fontSize: "0.875rem", color: "var(--syn-text-muted)" }}>{values[v] || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </section>
        </Col>
      </Row>

      {/* Back to top */}
      {showBackToTop ? (
        <Button
          type="button"
          color="primary"
          onClick={() => scrollTo("overview")}
          aria-label="Back to top"
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            width: 44,
            height: 44,
            padding: 0,
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowUp size={18} />
        </Button>
      ) : null}
    </Container>
  );
}
