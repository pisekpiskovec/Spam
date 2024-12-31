import { Statement, Program, Expression, BinaryExpression, NumericLiteral, Identifier, VariableDeclaration, AssigmentExpression, Property, ObjectLiteral, CallExpression, MemberExpression } from "./ast.ts";
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
    return this.parseAssigmentExpression();
  }

  private parseAssigmentExpression(): Expression{
    const left = this.parseObjectExpression();
    if(this.at().type == TokenType.Equals){
      this.advance();
      const value = this.parseAssigmentExpression();
      return { value, assigne: left, kind: "AssigmentExpr"} as AssigmentExpression;
    }
    return left;
  }

  private parseObjectExpression():Expression{
    if(this.at().type !== TokenType.OpenBrace) return this.parseAdditiveExpression();

    this.advance();
    const properties = new Array<Property>();
    while(this.notEOF() && this.at().type != TokenType.CloseBrace){
      const key = this.expect(TokenType.Identifier, "E: Identifier expected!!!").value;
      
      if(this.at().type == TokenType.Comma){
        this.advance();
        properties.push({key, kind: "Property", value: undefined} as Property);
        continue;
      } else if(this.at().type == TokenType.CloseBrace){
        properties.push({key, kind: "Property" } as Property);
        continue;
      }

      this.expect(TokenType.Colon, "E: Missing `:` following identifier");
      const value = this.parseExpression();
      properties.push({kind: "Property", value, key});
      if(this.at().type != TokenType.CloseBrace) this.expect(TokenType.Comma, "E: Expected `,` or `}` following property");
    }

    this.expect(TokenType.CloseBrace, "E: Expected `]`!!!");
    return {kind: "ObjectLiteral", properties} as ObjectLiteral;
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
    let left = this.parseCallMemberExpression();
    while(this.at().value == "/" || this.at().value == "*" || this.at().value == "%"){
      const operator = this.advance().value;
      const right = this.parseCallMemberExpression();
      left = {
        kind: "BinaryExpr",
        left, right, operator,
      } as BinaryExpression;
    }
    return left;
  }

  private parseCallMemberExpression(): Expression{
    const member = this.parseMemberExpression();

    if(this.at().type == TokenType.OpenParen){
      return this.parseCallExpression(member);
    }

    return member;
  }

  private parseCallExpression(caller: Expression): Expression{
    let callExpr: Expression = {
      kind: "CallExpr",
      caller,
      args: this.parseArguments(),
    } as CallExpression;

    if(this.at().type == TokenType.OpenParen){
      callExpr = this.parseCallExpression(callExpr);
    }

    return callExpr;
  }

  private parseArguments(): Expression[]{
    this.expect(TokenType.OpenParen, "E: Expected '('");
    const args = this.at().type == TokenType.CloseParen ? [] : this.parseArgumentsList();
    this.expect(TokenType.CloseParen, "E: Expected ')' inside arguments list");
    return args;
  }

  private parseArgumentsList(): Expression[]{
    const args = [this.parseAssigmentExpression()];
    while(this.at().type == TokenType.Comma && this.advance()){
      args.push(this.parseAssigmentExpression());
    }
    return args;
  }

  private parseMemberExpression(): Expression{
    let object = this.parsePrimaryExpression();
    while(this.at().type == TokenType.Dot || this.at().type == TokenType.OpenBracket){
      const operator = this.advance();
      let property: Expression;
      let computed: boolean;

      //non-computed
      if(operator.type == TokenType.Dot){
        computed = false;
        property = this.parsePrimaryExpression();
        if(property.kind != "Identifier") throw "E: Cannto use '.' without right side being a identifier!!";
      } else {
        computed = true;
        property = this.parseExpression();
        this.expect(TokenType.CloseBracket, "E: Missing closing bracket in computed value!!");
      }
      object = {
        kind: "MemberExpr",
        object,
        property,
        computed
      } as MemberExpression;
    }
    return object;
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
