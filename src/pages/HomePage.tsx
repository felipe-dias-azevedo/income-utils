import { Flex, Heading, Text } from "@radix-ui/themes";
import { Link } from "react-router-dom";
import ContentCard from "../components/Common/ContentCard";
import { HOME_PAGE_GROUPS, PAGE_DEFINITIONS } from "../routes";

export default function HomePage() {
  return (
    <Flex direction="column" gap="4">
      {HOME_PAGE_GROUPS.map((group) => (
        <Flex key={group.title} direction="column" gap="3">
          <Heading size="3">{group.title}</Heading>

          {group.pages.map((pageKey) => {
            const page = PAGE_DEFINITIONS[pageKey];
            const Icon = page.icon;

            return (
              <Link
                key={pageKey}
                to={page.path}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <ContentCard p="4" gap="3" style={{ cursor: "pointer" }}>
                  <Flex align="center" gap="3">
                    <Flex
                      align="center"
                      justify="center"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "var(--radius-full)",
                        backgroundColor: "var(--accent-a3)",
                        color: "var(--accent-a11)"
                      }}
                    >
                      <Icon width={16} height={16} />
                    </Flex>

                    <Flex direction="column" gap="1" style={{ flex: 1 }}>
                      <Heading size="3">{page.label}</Heading>
                      <Text size="2" color="gray">
                        {page.description}
                      </Text>
                    </Flex>
                  </Flex>
                </ContentCard>
              </Link>
            );
          })}
        </Flex>
      ))}
    </Flex>
  );
}
