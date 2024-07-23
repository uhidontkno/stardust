{
  description = "Catway";
  inputs = {
    nixpkgs = {
      url = "github:NixOS/nixpkgs/nixos-unstable";
    };
    flake-utils = {
      url = "github:numtide/flake-utils";
    };
  };
  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config = { };
        };
      in
      {
        devShells.default = pkgs.mkShell
          {
            packages = with pkgs; [
              nodejs_latest # NodeJS runtime + NPM
              nodePackages_latest.pnpm # PNPM package manager
              postgresql_16
              libpqxx
            ];
          };
      }
    );
}
