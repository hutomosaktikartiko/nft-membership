import type { Route } from "./+types/home";
import { CreateMintTab } from "../components/home/create-mint-tab";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { TransferTab } from "../components/home/transfer-tab";
import { MainLayout } from "../components/layout/main-layout";
import { MyPassTab } from "~/components/home/my-pass-tab";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NFT Pass" },
    {
      name: "description",
      content: "Example of implementations of NFT Membership Pass",
    },
  ];
}

export default function Home() {
  return (
    <MainLayout>
      <div className="flex min-h-screen justify-center w-full bg-gray-50">
        <Tabs defaultValue="my-pass" className="w-full max-w-2xl m-4">
          <TabsList className="mx-auto grid w-full grid-cols-3">
            <TabsTrigger value="my-pass">My Pass</TabsTrigger>
            <TabsTrigger value="create-mint">Create Mint</TabsTrigger>
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
          </TabsList>
          <div className="min-h-[500px] w-full">
            <TabsContent value="my-pass" className="h-full">
              <MyPassTab />
            </TabsContent>
            <TabsContent value="create-mint" className="h-full">
              <CreateMintTab />
            </TabsContent>
            <TabsContent value="transfer" className="h-full">
              <TransferTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </MainLayout>
  );
}
