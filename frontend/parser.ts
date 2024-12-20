import { Statement, Program, Expression, BinaryExpression, NumericLiteral, Identifier, VariableDeclaration } from "./ast.ts";
import { tokenize, Token, TokenType} from "./lexer.ts"; 

export default class Parser {
  private tokens: Token[] = [];

  private notEOF():boolean{
    return this.tokens[0].type != TokenType.EOF;
  }

  private at(){
    return this.tokens[0] as Token;
  }

  private advance(){
    return this.tokens.shift() as Token;
  }
  
  private expect(type: TokenType, err: any){
    const prev = this.tokens.shift() as Token;
    if(!prev || prev.type != type){
      console.log("W: Parser: ", err, prev, " Expecting: ", type)
      Deno.exit(1);
    }
    return prev;
  }

  public produceAST(sourceCode: string):Program{
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    while(this.notEOF()){
      program.body.push(this.parseStatement());
    }
    
    return program;
  }

  private parseStatement(): Statement{
    switch(this.at().type){
      // case TokenType.Number:
      // case TokenType.Identifier:
      // case TokenType.String:
      case TokenType.Set:
      case TokenType.Const:
        return this.parseVariableDeclaration();
      // case TokenType.BinaryOperator:
      // case TokenType.Equals:
      // case TokenType.OpenParen:
      // case TokenType.CloseParen:
      // case TokenType.EOF:
      default:
        return this.parseExpression();
    }
  }

  parseVariableDeclaration(): Statement{
    const isConstant = this.advance().type == TokenType.Const;
    const identifier = this.expect(TokenType.Identifier, "E: Expected identifier!!!").value;
    if(this.at().type == TokenType.Semicolon){
      this.advance();
      if(isConstant) throw "E: Constants must have value!!";
      return {kind: "VariableDeclaration", identifier, constant: false } as VariableDeclaration;
    }

    this.expect(TokenType.Equals, "E: Expected 'as'!!!");
    const declaration = {kind: "VariableDeclaration", identifier, value: this.parseExpression(), constant: isConstant} as VariableDeclaration;
    this.expect(TokenType.Semicolon, "E: Variable declaration must end with semicolon!!!");
    return declaration;
  }

  private parseExpression():Expression{
    return this.parseAdditiveExpression();
  }

  private parseAdditiveExpression(): Expression{
    let left = this.parseMultiplicativeExpression();
    while(this.at().value == "+" || this.at().value == "-"){
      const operator = this.advance().value;
      const right = this.parseMultiplicativeExpression();
      left = {
        kind: "BinaryExpr",
        left, right, operator,
      } as BinaryExpression;
    }
    return left;
  }

  private parseMultiplicativeExpression(): Expression{
    let left = this.parsePrimaryExpression();
    while(this.at().value == "/" || this.at().value == "*" || this.at().value == "%"){
      const operator = this.advance().value;
      const right = this.parsePrimaryExpression();
      left = {
        kind: "BinaryExpr",
        left, right, operator,
      } as BinaryExpression;
    }
    return left;
  }
  
  private parsePrimaryExpression(): Expression{
    const tk = this.at().type;
    switch(tk){
      case TokenType.Identifier:
        return {kind: "Identifier", symbol: this.advance().value} as Identifier;
      case TokenType.Number:
        return {kind: "NumericLiteral", value: parseFloat(this.advance().value)} as NumericLiteral;
      case TokenType.OpenParen: {
        this.advance();
        const value = this.parseExpression();
        this.expect(TokenType.CloseParen, "Unexpected char found at the place of closing parenthesis.");
        return value;
      }
      default:
        console.error("E: Parser: Unexpected token found!!!", this.at());
        Deno.exit(1);
    }
  }
}
