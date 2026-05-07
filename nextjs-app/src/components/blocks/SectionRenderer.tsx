import type { Section, SectionSubPage } from "@/sanity/queries";
import { SectionText } from "./SectionText";
import { SectionImages } from "./SectionImages";
import { SectionVideo } from "./SectionVideo";
import { SectionIntegration } from "./SectionIntegration";

function SubPage({ section }: { section: SectionSubPage }) {
  return (
    <div>
      {section.heading && <h2 className="mb-8">{section.heading}</h2>}
      {section.sections?.map((s) => (
        <SectionRenderer key={s._key} section={s} />
      ))}
    </div>
  );
}

export function SectionRenderer({ section }: { section: Section }) {
  switch (section._type) {
    case "sectionText":
      return <SectionText section={section} />;
    case "sectionImages":
      return <SectionImages section={section} />;
    case "sectionVideo":
      return <SectionVideo section={section} />;
    case "sectionIntegration":
      return <SectionIntegration section={section} />;
    case "sectionSubPage":
      return <SubPage section={section} />;
    default:
      return null;
  }
}
