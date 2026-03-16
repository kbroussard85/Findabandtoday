# Phase 4 Validation Design Document

## 1. Problem Statement
The Phase 4 Master Plan (Agentic Negotiation) requires comprehensive testing and validation for its core AI components: the AI Liaison, the LangGraph Negotiation engine, and the Maximizer tour optimizer. Currently, these features lack automated test coverage, leaving the platform vulnerable to regressions, compliance violations (e.g., negotiating below minimum rates), and unpredictable AI behaviors.

## 2. Requirements
**Functional Requirements:**
- Verify AI Liaison generates context-aware outreach drafts.
- Validate LangGraph transitions between Propose, Evaluate, Counter-Offer, and Finalize nodes.
- Ensure the AI Negotiator respects user-defined compliance rules (e.g., `minRate`).
- Verify the Maximizer suggests geographically logical and available bookings.
- Validate End-to-End user flows in the browser (triggering AI, receiving responses).

**Non-Functional Requirements:**
- Tests must be fast, deterministic, and isolated.
- Zero API costs incurred during routine CI/CD test runs.

**Constraints:**
- Must use the existing Vitest configuration for unit/integration tests.
- Must use the existing Playwright configuration for E2E tests.

## 3. Approach
**Selected Approach: Network-Level Mocking**
We will implement `msw` (Mock Service Worker) to intercept HTTP requests from the OpenAI SDKs during Vitest runs. For browser-based E2E tests, we will utilize Playwright's `page.route` to fulfill API requests with predefined JSON payloads representing typical LLM responses.

**Alternatives Considered:**
- *Service-Level Stubbing*: Rejected because it bypasses the SDK and prompt-formatting logic, reducing confidence.
- *Live Model Testing*: Rejected due to latency, potential flakiness, and associated API costs.

## 4. Architecture
**Test Boundaries & Data Flow:**
1.  **Unit Tests (Vitest + MSW):**
    -   `src/lib/ai/agents/liaison.ts` -> Calls OpenAI SDK -> MSW intercepts `/v1/chat/completions` -> Returns fixed "Draft Offer" JSON.
    -   `src/lib/ai/negotiation/graph.ts` -> LangGraph state transitions -> MSW mocks evaluation outcomes.
2.  **Geospatial Tests (Vitest + Test DB):**
    -   `src/lib/ai/agents/maximizer.ts` -> Queries test database (PostGIS seeded with mock locations) -> Verifies correct radius and priority logic.
3.  **E2E Tests (Playwright):**
    -   `SwipeToBook.spec.ts` -> Simulates UI interactions -> Triggers Next.js Server Actions -> `page.route` intercepts AI API calls -> Validates UI state updates (e.g., Contract generated, offer submitted).

**Key Interfaces:**
-   `__tests__/mocks/handlers.ts`: Defines MSW request handlers for OpenAI endpoints.
-   `__tests__/fixtures/`: Contains realistic JSON payloads for LLM responses and PostGIS coordinate sets.

## 5. Agent Team
- **`tester`**: Will implement the Vitest suites (Liaison, LangGraph, Maximizer), set up the MSW mocks, and write the Playwright E2E scenarios.
- **`coder`**: May assist if minor code refactoring is required in the application code to make it more testable (e.g., dependency injection for geographic databases).

## 6. Risk Assessment & Mitigation
- **Risk**: Mocked LLM responses may diverge from actual model behaviors over time.
  - **Mitigation**: We will store raw JSON dumps from real API responses in a `fixtures` folder so the mocks represent real-world data shapes.
- **Risk**: PostGIS geospatial queries are difficult to test in a standard CI environment without a spatial database.
  - **Mitigation**: Ensure the test database uses the `postgis` extension or mock the specific query builder layer if database instantiation fails in CI.

## 7. Success Criteria
- `vitest` runs successfully and passes all AI logic unit tests (Liaison, Negotiator, Maximizer) without hitting external APIs.
- `playwright test` successfully runs through the Swipe-to-Book and Negotiation flows, resulting in a mocked success state.
- `docs/PHASE_4_MASTER_PLAN.md` is fully checked off and completed.