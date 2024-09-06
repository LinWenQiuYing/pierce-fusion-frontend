import { DirectAnalysisPostType } from "@/types";
import { post } from "./index.ts";

const stellarUrl = "/pierce/stellar";
const cypherUrl = "/pierce/cypherResource";

// cypher语法校验
export async function directAnalysis(json: DirectAnalysisPostType) {
  const res = await post(`${stellarUrl}/directedAnalysis`, json);
  return res;
}

// cypher语法校验
export async function cypherGrammarVerify(json: any) {
  const res = await post(`${cypherUrl}/cypherGrammarVerify`, json);
  return res;
}
