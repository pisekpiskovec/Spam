export enum TokenType {
  Number,
  Identifier,
  String,
  Set,
  Const,
  BinaryOperator,
  Equals,
  Comma,
  Colon,
  Semicolon,
  OpenParen, //(
  CloseParen, //)
  OpenBrace, //[
  CloseBrace, //]
  EOF,
}

const KEYWORDS: Record<string, TokenType> = {
  set: TokenType.Set,
  to: TokenType.Equals,
  const: TokenType.Const,
};

export interface Token {
  value: string;
  type: TokenType;
}

function token(value = "", type: TokenType): Token {
  return { value, type };
}

function isAlpha(src: string) {
  return src.toUpperCase() != src.toLowerCase();
}

function isSkippable(src: string) {
  return src == " " || src == "\n" || src == "\t" || src == "\r";
}

function isInt(src: string) {
  const c = src.charCodeAt(0);
  const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
  return c >= bounds[0] && c <= bounds[1];
}

export function tokenize(source: string): Token[] {
  const tokens = new Array<Token>();
  const src = source.split("");

  while(src.length > 0) {
    if(src[0] == "("){
      tokens.push(token(src.shift(), TokenType.OpenParen));
    } else if (src[0] == ")") {
      tokens.push(token(src.shift(), TokenType.CloseParen));
    } else if (src[0] == "{") {
      tokens.push(token(src.shift(), TokenType.OpenBrace));
    } else if (src[0] == "}") {
      tokens.push(token(src.shift(), TokenType.CloseBrace));
    } else if (src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" || src[0] == "%") {
      tokens.push(token(src.shift(), TokenType.BinaryOperator));
    } else if (src[0] == "=") {
      tokens.push(token(src.shift(), TokenType.Equals));
    } else if (src[0] == ";") {
      tokens.push(token(src.shift(), TokenType.Semicolon));
    } else if (src[0] == ":") {
      tokens.push(token(src.shift(), TokenType.Colon));
    } else if (src[0] == ",") {
      tokens.push(token(src.shift(), TokenType.Comma));
    } else {
      if(isInt(src[0])) {
        let num = "";
        while (src.length > 0 && isInt(src[0])) {
          num += src.shift();
        }
        tokens.push(token(num, TokenType.Number));
      }
      else if (isAlpha(src[0])) {
        let ident = "";
        while (src.length > 0 && isAlpha(src[0])){
          ident += src.shift();
        }
        //check for reserved keyword
        const reserved = KEYWORDS[ident];
        if(typeof reserved == "number") {
          tokens.push(token(ident, reserved));
        } else {
          tokens.push(token(ident, TokenType.Identifier));
        }
      }
      else if (isSkippable(src[0])) {
        src.shift(); //skip the current character
      }
      else {
        console.error(
          "Unrecognized char found in src:",
          src[0].charCodeAt(0),
          src[0]
        );
        Deno.exit(1);
      }
    }
  }

  tokens.push({type: TokenType.EOF, value:"EndOfFile"});
  return tokens;
}
