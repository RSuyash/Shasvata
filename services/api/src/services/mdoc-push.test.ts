import { describe, expect, it } from "vitest";
import {
  buildMdocPayload,
  deriveMdocSourceDetail,
  splitLeadName,
} from "./mdoc-push.js";

describe("splitLeadName", () => {
  it("splits a full name into first, middle, and last segments", () => {
    expect(splitLeadName("  Sanjay Kumar Joy  ")).toEqual({
      firstName: "Sanjay",
      middleName: "Kumar",
      lastName: "Joy",
    });
  });

  it("falls back safely when the name only has one token", () => {
    expect(splitLeadName("Madonna")).toEqual({
      firstName: "Madonna",
      middleName: "",
      lastName: "",
    });
  });
});

describe("deriveMdocSourceDetail", () => {
  it("prefers Google Ad when click ids are present", () => {
    expect(
      deriveMdocSourceDetail({
        gclid: "abc123",
        fallbackSourceDetail: "Website",
      }),
    ).toBe("Google Ad");
  });

  it("maps known UTM sources before falling back to Website", () => {
    expect(
      deriveMdocSourceDetail({
        utmSource: "instagram",
        fallbackSourceDetail: "Website",
      }),
    ).toBe("Instagram");

    expect(
      deriveMdocSourceDetail({
        utmSource: "some-random-network",
        fallbackSourceDetail: "Website",
      }),
    ).toBe("Website");
  });
});

describe("buildMdocPayload", () => {
  it("builds a form payload with mapped preferences and warnings for unmapped values", () => {
    const payload = buildMdocPayload({
      project: {
        id: "cmnhqmbbu0000q6u9ms9l84zi",
        name: "Topaz Towers",
      },
      lead: {
        id: "lead_123",
        fullName: "Riya Patel",
        email: "riya@example.com",
        phone: "+91 99999 11111",
        message: "Need more details.",
        sourcePage: "https://topaz-towers.in/?utm_source=google&utm_medium=cpc",
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "topaz-launch",
        utmContent: "hero-copy-a",
        utmTerm: "topaz towers",
        gclid: "gclid-123",
        gbraid: null,
        wbraid: null,
        serviceInterest: ["topaz-2-bhk"],
        budgetRange: "₹60–70 Lakhs",
        timeline: "Immediate",
        problemSummary: "Need more details.",
        createdAt: new Date("2026-04-20T09:15:00.000Z"),
      },
      config: {
        endpoint: "https://aakar.maksoftbox.com//MDocBoxAPI/MdocAddEnquiryORTeleCalling/",
        apiKey: "secret",
        dataFrom: "E",
        source: "Digitals",
        fallbackSourceDetail: "Website",
        enumMappings: {
          preferences: {
            "topaz-2-bhk": "2 BHK",
          },
        },
      },
    });

    expect(payload.formBody.get("DataFrom")).toBe("E");
    expect(payload.formBody.get("FirstName")).toBe("Riya");
    expect(payload.formBody.get("Source")).toBe("Digitals");
    expect(payload.formBody.get("SourceDetail")).toBe("Google Ad");
    expect(payload.formBody.get("Preferences")).toBe("2 BHK");
    expect(payload.formBody.get("Budget")).toBe("");
    expect(payload.metadata.mappingWarnings).toEqual(["budgetRange", "timeline"]);
    expect(payload.formBody.get("UtmCampaignSource")).toBe("google");
    expect(payload.formBody.get("UtmProjectId")).toBe("cmnhqmbbu0000q6u9ms9l84zi");
  });
});
