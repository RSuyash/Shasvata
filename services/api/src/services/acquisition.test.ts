import { describe, expect, it } from "vitest";
import {
  decryptIntegrationPayload,
  encryptIntegrationPayload,
  parseLeadCsvRows,
  resolveCampaignAutoMatch,
} from "./acquisition.js";

describe("acquisition service helpers", () => {
  it("parses CSV text with an explicit field mapping", () => {
    const rows = parseLeadCsvRows({
      csvText:
        "Name,Email,Phone,Campaign,Meta Lead ID\nAda Lovelace,ada@example.com,+91 90000 11111,Launch A,lead_123\n",
      mapping: {
        fullName: "Name",
        email: "Email",
        phone: "Phone",
        utmCampaign: "Campaign",
        externalLeadId: "Meta Lead ID",
      },
    });

    expect(rows).toEqual([
      {
        rowNumber: 2,
        lead: {
          fullName: "Ada Lovelace",
          email: "ada@example.com",
          phone: "+91 90000 11111",
          utmCampaign: "Launch A",
          externalLeadId: "lead_123",
        },
      },
    ]);
  });

  it("reports invalid CSV rows without dropping the whole import", () => {
    const rows = parseLeadCsvRows({
      csvText: "Name,Email\nMissing Email,\nGrace Hopper,grace@example.com\n",
      mapping: {
        fullName: "Name",
        email: "Email",
      },
    });

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      rowNumber: 2,
      error: "Email is required.",
    });
    expect(rows[1]).toEqual({
      rowNumber: 3,
      lead: {
        fullName: "Grace Hopper",
        email: "grace@example.com",
      },
    });
  });

  it("round-trips encrypted credential payloads with AES-GCM", () => {
    const key = "test-integration-key-material";
    const encrypted = encryptIntegrationPayload(
      {
        accessToken: "secret-token",
        refreshToken: "refresh-token",
      },
      key,
    );

    expect(encrypted).toMatch(/^v1:/);
    expect(encrypted).not.toContain("secret-token");
    expect(decryptIntegrationPayload(encrypted, key)).toEqual({
      accessToken: "secret-token",
      refreshToken: "refresh-token",
    });
  });

  it("auto-matches campaigns by UTM first, then external campaign id", () => {
    const campaigns = [
      {
        id: "campaign_google",
        utmSource: "google",
        utmCampaign: "spring-launch",
        externalCampaignId: "g-1",
      },
      {
        id: "campaign_meta",
        utmSource: "facebook",
        utmCampaign: "lead-forms",
        externalCampaignId: "m-1",
      },
    ];

    expect(
      resolveCampaignAutoMatch({
        campaigns,
        utmSource: "Facebook",
        utmCampaign: "Lead-Forms",
        externalCampaignId: "g-1",
      }),
    ).toBe("campaign_meta");

    expect(
      resolveCampaignAutoMatch({
        campaigns,
        externalCampaignId: "g-1",
      }),
    ).toBe("campaign_google");
  });
});
